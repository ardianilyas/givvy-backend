import { asyncHandler } from "@/shared/utils/async-handler";
import type { DonationService } from "./donation.service";
import type { AuthenticatedRequest } from "@/shared/types";
import type { Request, Response } from "express";
import { validate } from "@/shared/utils/validate";
import { createDonationDto } from "./donation.dto";
import { sendSuccess } from "@/shared/utils/response";
import { env } from "@/shared/config/env";
import { UnauthorizedError } from "@/shared/errors/unauthorized";

export class DonationController {
  constructor(private readonly donationService: DonationService) {}

  createDonation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const data = validate(createDonationDto, req.body);

    const response = await this.donationService.createDonation(data, req.auth.user.id, req.log);

    return sendSuccess(res, "Donation created", response, 201);
  });

  handlePaymentWebhook = asyncHandler(async (req: Request, res: Response) => {
    const token = req.header("x-borderpay-token");

    if (!token || token !== env.BORDERPAY_WEBHOOK_TOKEN) throw new UnauthorizedError("Invalid webhook token");

    const payload = req.body;

    const result = await this.donationService.handlePaymentWebhook(payload, req.log);

    return sendSuccess(res, "Payment webhook received", result);
  });
}
