import { db } from "@/shared/db";
import type { CreateDonationDto } from "./donation.dto";
import { creatorBalances, creators, donations, payments } from "@/shared/db/schemas";
import { createQrisPayment, type BorderPayPaymentResponse, type CreateQrisPaymentParams } from "@/shared/integrations/borderpay";
import { and, eq, ne, sql } from "drizzle-orm";
import { calculateTax } from "./utils/calculate-tax";
import type { BorderPayWebhookPayload } from "./donation.types";
import { NotFoundError } from "@/shared/errors/not-found";
import { UnprocessableEntityError } from "@/shared/errors/unprocessable-entity";
import type { Logger } from "pino";
import type { Transaction } from "@/shared/types/db.types";
import { BORDERPAY_EVENTS, DONATION_STATUS, PAYMENT_STATUS, type PaymentWebhookData } from "./donation.constant";
import { addDonationAlert } from "../alert/alert.queue";

export class DonationService {
  async createDonation(data: CreateDonationDto, userId: string, log: Logger) {
    const [donation] = await db.insert(donations).values({ ...data, userId }).returning();

    if (!donation) return;

    log.info(
      {
        action: "donation.created",
        donationId: donation.id,
        userId
      },
      "Donation created successfully",
    );

    const amountToPay = calculateTax(donation.amount);

    const paymentResponse = await this.createPayment({
      amount: amountToPay,
      referenceId: donation.id,
    }, donation.id, log);

    const payment = await this.insertPayment(paymentResponse, donation.id, log);

    return {
      donation,
      payment: {
        ...payment,
        qrString: paymentResponse.qr_string,
        payUrl: paymentResponse.pay_url,
        expiresAt: paymentResponse.expires_at,
      },
    }
  }

  async handlePaymentWebhook(payload: BorderPayWebhookPayload, log: Logger) {
    const { event, data } = payload;

    return await db.transaction(async (tx) => {
      const payment = await this.findPaymentByReferenceId(tx, data.reference_id);

      this.validatePaymentAmount(payment.paymentAmount, data.amount, log);

      if (payment.paymentStatus === PAYMENT_STATUS.PAID) {
        log.info(
          {
            action: "payment.webhook.duplicate",
            donationId: payment.donationId,
          },
          "Payment already processed",
        );
        return { processed: false, reason: "Already paid" };
      }

      if (event === BORDERPAY_EVENTS.PAID) {
        const result = await this.handlePaymentPaid(tx, payment);

        log.info(
          {
            action: "payment.webhook.paid",
            donationId: result.donationId,
            creatorId: result.creatorId,
          },
          "Payment processed successfully",
        );

        return result;
      }

      const status =
        event === BORDERPAY_EVENTS.EXPIRED
        ? PAYMENT_STATUS.EXPIRED
        : PAYMENT_STATUS.FAILED;

      const result = await this.handlePaymentFailed(tx, payment, status);

      log.info(
        {
          action: "payment.webhook.status_updated",
          donationId: payment.donationId,
          status
        },
        "Payment status updated",
      );

      return result;
    });
  }

  // Call borderpay create payment
  private async createPayment(data: CreateQrisPaymentParams, donationId: string, log: Logger) {
    try {
      const paymentResponse = await createQrisPayment({
        amount: data.amount,
        referenceId: data.referenceId,
      });

      log.info(
        {
          action: "payment.gateway.success",
          donationId,
          referenceId: data.referenceId,
        },
        "Payment gateway request success"
      );

      return paymentResponse;
    } catch (e) {
      await db.update(donations).set({
        status: "failed",
        updatedAt: new Date()
      }).where(eq(donations.id, donationId));

      log.error(
        {
          action: "payment.gateway.failed",
          donationId,
          e,
        },
        "Failed to create payment through gateway",
      );

      throw e;
    }
  }

  // Insert payment to database
  private async insertPayment(paymentResponse: BorderPayPaymentResponse, donationId: string, log: Logger) {
    const [payment] = await db.insert(payments).values({
      donationId: donationId,
      referenceId: paymentResponse.reference_id,
      amount: paymentResponse.amount,
      paymentUrl: paymentResponse.pay_url,
      paymentMethod: "qris",
      status: "pending",
      expiredAt: new Date(paymentResponse.expires_at),
    }).returning();

    if (!payment) throw new Error("Failed to create payment");

    log.info(
      {
        action: "payment.created",
        paymentId: payment.id,
        donationId,
        status: payment.status
      },
      "Payment created successfully",
    );

    return payment;
  }

  // find payment by reference id
  private async findPaymentByReferenceId(tx: Transaction, referenceId: string) {
    const [payment] = await tx.select({
      paymentId: payments.id,
      paymentStatus: payments.status,
      paymentAmount: payments.amount,
      donationId: donations.id,
      donationStatus: donations.status,
      donationAmount: donations.amount,
      donationMessage: donations.message,
      creatorId: donations.creatorId,
      alertToken: creators.alertToken,
    })
      .from(payments)
      .innerJoin(donations, eq(payments.donationId, donations.id))
      .innerJoin(creators, eq(creators.id, donations.creatorId))
      .where(eq(payments.referenceId, referenceId))
      .limit(1);

    if (!payment) throw new NotFoundError("Payment not found");

    return payment;
  }

  // validate payment amount from webhook and database
  private validatePaymentAmount(paymentAmount: string | number, webhookAmount: string | number, log: Logger) {
    if (Number(paymentAmount) !== Number(webhookAmount)) {
      log.warn(
        {
          action: "payment.amount.mismatch",
          paymentAmount,
          webhookAmount,
        },
        "Payment amount mismatch",
      );
      throw new UnprocessableEntityError("Payment amount mismatch");
    }
  }

  // handle payment paid event
  private async handlePaymentPaid(tx: Transaction, payment: PaymentWebhookData) {
    const now = new Date();

    const [updatedPayment] = await tx.update(payments).set({
      status: PAYMENT_STATUS.PAID,
      paidAt: now,
      updatedAt: now,
    }).where(
      and(
        eq(payments.id, payment.paymentId),
        ne(payments.status, PAYMENT_STATUS.PAID),
      ),
    ).returning({ id: payments.id });

    if (!updatedPayment) return { processed: false, reason: "Already paid" };

    await tx
      .update(donations)
      .set({
        status: DONATION_STATUS.PAID,
        paidAt: now,
        updatedAt: now,
      })
      .where(eq(donations.id, payment.donationId));

    const [updatedBalance] = await tx
      .update(creatorBalances)
      .set({
        balance: sql`${creatorBalances.balance} + ${payment.donationAmount}`,
        updatedAt: now,
      })
      .where(eq(creatorBalances.creatorId, payment.creatorId))
      .returning({ id: creatorBalances.id });

    if (!updatedBalance) {
      throw new Error("Creator balance not found");
    }

    await addDonationAlert(payment.alertToken, {
      type: "text",
      donationId: payment.donationId,
      data: {
        message: payment.donationMessage,
        amount: payment.donationAmount
      }
    });

    return {
      processed: true,
      status: PAYMENT_STATUS.PAID,
      donationId: payment.donationId,
      creatorId: payment.creatorId,
      alertToken: payment.alertToken,
      donationAmount: payment.donationAmount,
    };
  }

  // handle payment failed or expired event
  private async handlePaymentFailed(tx: Transaction, payment: PaymentWebhookData, status: typeof PAYMENT_STATUS.FAILED | typeof PAYMENT_STATUS.EXPIRED) {
    const now = new Date();

    const [updatedPayment] = await tx
      .update(payments)
      .set({
        status,
        updatedAt: now,
      })
      .where(
        and(
          eq(payments.id, payment.paymentId),
          ne(payments.status, PAYMENT_STATUS.PAID),
        ),
      )
      .returning({ id: payments.id });

    if (!updatedPayment) {
      return {
        processed: false,
        reason: "Payment already paid",
      };
    }

    await tx
      .update(donations)
      .set({
        status,
        updatedAt: now,
      })
      .where(
        and(
          eq(donations.id, payment.donationId),
          ne(donations.status, DONATION_STATUS.PAID),
        ),
      );

    return {
      processed: true,
      status,
    };
  }
}
