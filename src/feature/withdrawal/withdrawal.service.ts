import { db } from "@/shared/db"
import { creatorBalances, creatorBankAccounts, creators, withdrawals } from "@/shared/db/schemas"
import { NotFoundError } from "@/shared/errors/not-found";
import { and, eq, gte, sql } from "drizzle-orm"
import type { CreateWithdrawalDto } from "./withdrawal.dto";
import { decrypt } from "@/shared/utils/encryption";
import { createDisbursement } from "@/shared/integrations/borderpay";
import { UnprocessableEntityError } from "@/shared/errors/unprocessable-entity";
import { BadRequestError } from "@/shared/errors/bad-request";
import type { Logger } from "pino";
import { CREATOR_NOT_FOUND, INSUFFICIENT_BALANCE } from "./withdrawal.constant";

const GATEWAY_FEE = 5000;
const PLATFORM_FEE_RATE = 0.05;

export class WithdrawalService {

  async createWithdrawal(
    data: CreateWithdrawalDto,
    userId: string,
    creatorId: string,
    log: Logger
  ) {
    // 1. Validate ownership
    await this.ensureUserIsCreator(userId, creatorId);

    // 2. Validate bank account ownership
    const bankAccount = await this.getBankAccountByIdAndCreatorId(
      data.bankAccountId,
      creatorId
    );

    if (!Number.isSafeInteger(data.amount) || data.amount <= 0) {
      throw new BadRequestError("Invalid withdrawal amount");
    }

    // 3. Calculate fees
    const platformFee = Math.floor(
      data.amount * PLATFORM_FEE_RATE
    );

    const gatewayFee = GATEWAY_FEE;

    const totalDeducted =
      data.amount + platformFee + gatewayFee;

    // 4. Generate reference
    const referenceId = `GWD-${crypto.randomUUID()}`;

    // 5. Atomic balance deduction + create pending withdrawal
    const withdrawal = await db.transaction(async (tx) => {
      const [updatedBalance] = await tx
        .update(creatorBalances)
        .set({
          balance: sql`${creatorBalances.balance} - ${totalDeducted}`,
        })
        .where(
          and(
            eq(creatorBalances.creatorId, creatorId),
            gte(creatorBalances.balance, totalDeducted)
          )
        )
        .returning({
          balance: creatorBalances.balance,
        });

      if (!updatedBalance) {
        throw new UnprocessableEntityError(INSUFFICIENT_BALANCE);
      }

      log.info(
        {
          action: "withdraw.balance.updated",
          creatorBalance: updatedBalance.balance,
          creatorId,
        },
        "Creator balance updated",
      );

      const [createdWithdrawal] = await tx
        .insert(withdrawals)
        .values({
          creatorId,
          bankCode: bankAccount.bankCode,
          referenceId,
          bankAccountId: bankAccount.id,
          accountNameEncrypted: bankAccount.accountNameEncrypted,
          accountNumberEncrypted: bankAccount.accountNumberEncrypted,
          accountNumberLast4: bankAccount.accountNumberLast4,
          amount: data.amount,
          platformFee,
          gatewayFee,
          totalDeducted,
          status: "pending",
        })
        .returning({
          id: withdrawals.id,
        });

      log.info(
        {
          action: "withdrawal.created",
          withdrawalId: createdWithdrawal?.id,
          creatorId,
        },
        "Withdrawal created",
      );

      return {
        withdrawal: createdWithdrawal,
        balance: updatedBalance.balance,
      };
    });

    // 6. Call gateway AFTER reserving balance
    try {
      const accountName = decrypt(bankAccount.accountNameEncrypted);
      const accountNumber = decrypt(bankAccount.accountNumberEncrypted);

      const gatewayResponse = await createDisbursement({
        reference_id: referenceId,
        amount: data.amount,
        account_name: accountName,
        account_number: accountNumber,
        bank_code: bankAccount.bankCode,
      });

      log.info(
        {
          action: "disbursement.created",
          referenceId,
          creatorId
        },
        "Disbursement created",
      );

      // 7. Update withdrawal from gateway response
      const [updatedWithdrawal] = await db
        .update(withdrawals)
        .set({
          status: gatewayResponse.status,
          gatewayReference: gatewayResponse.id,
          failureReason: gatewayResponse.fail_reason,
        })
        .where(eq(withdrawals.referenceId, referenceId))
        .returning();

      return {
        withdrawal: updatedWithdrawal?.id,
        balance: withdrawal.balance,
      };

    } catch (error) {
      // 8. Gateway failure: refund reserved balance
      await db.transaction(async (tx) => {
        await tx
          .update(creatorBalances)
          .set({
            balance: sql`${creatorBalances.balance} + ${totalDeducted}`,
          })
          .where(eq(creatorBalances.creatorId, creatorId));

        log.info(
          {
            action: "balance.refunded",
            creatorId,
          },
          "Balance refunded"
        );

        await tx
          .update(withdrawals)
          .set({
            status: "failed",
            failureReason:
              error instanceof Error
              ? error.message
              : "Disbursement failed",
          })
          .where(eq(withdrawals.referenceId, referenceId));

        log.info(
          {
            action: "withdrawal.status.updated",
            status: "failed",
            referenceId,
            creatorId,
          },
          "Withdrawal status update to failed",
        )
      });

      log.error(error instanceof Error ? error.message : "Disbursement failed");

      throw error;
    }
  }

  private async ensureUserIsCreator(userId: string, creatorId: string) {
    const [creator] = await db
      .select({
        id: creators.id,
        userId: creators.userId,
      })
      .from(creators)
      .where(
        and(
          eq(creators.id, creatorId),
          eq(creators.userId, userId)
        )
      )
      .limit(1);

    if (!creator) throw new NotFoundError(CREATOR_NOT_FOUND);

    return !!creator;
  }

  private async getBankAccountByIdAndCreatorId(bankAccountId: string, creatorId: string) {
    const [bankAccount] = await db
      .select()
      .from(creatorBankAccounts)
      .where(
        and(
          eq(creatorBankAccounts.id, bankAccountId),
          eq(creatorBankAccounts.creatorId, creatorId),
        )
      )
      .limit(1);

    if (!bankAccount) throw new NotFoundError("Bank account not found");

    return bankAccount;
  }

  private async getCreatorBalance(creatorId: string): Promise<number> {
    const [creatorBalance] = await db
      .select({ balance: creatorBalances.balance })
      .from(creatorBalances)
      .where(eq(creatorBalances.creatorId, creatorId))
      .limit(1);

    if (!creatorBalance) throw new Error(CREATOR_NOT_FOUND);

    return creatorBalance.balance;
  }
}
