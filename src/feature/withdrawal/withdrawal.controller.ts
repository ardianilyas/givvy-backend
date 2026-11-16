import { asyncHandler } from "@/shared/utils/async-handler";
import type { WithdrawalService } from "./withdrawal.service";
import type { AuthenticatedRequest } from "@/shared/types";
import type { Response } from "express";
import { validate } from "@/shared/utils/validate";
import { createWithdrawalDto } from "./withdrawal.dto";
import { getCreatorById } from "../creator/dto/creator.dto";
import { sendSuccess } from "@/shared/utils/response";

export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  createWithdrawal = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const data = validate(createWithdrawalDto, req.body);
    const creatorId = validate(getCreatorById, req.params.creatorId);
    const response = await this.withdrawalService.createWithdrawal(data, req.auth.user.id, creatorId, req.log);
    return sendSuccess(res, "Withdraw balance successfully", response, 201);
  });
}
