import type { Response } from "express";
import type { AuthenticatedRequest } from "@/shared/types";
import { asyncHandler } from "@/shared/utils/async-handler";
import { validate } from "@/shared/utils/validate";

import {
  createCreatorBankAccountDto,
  getCreatorId,
} from "../dto/creator-bank-account.dto";

import { CreatorBankAccountService } from "../services/creator-bank-account.service";
import { sendSuccess } from "@/shared/utils/response";

export class CreatorBankAccountController {
  constructor(
    private readonly creatorBankAccountService: CreatorBankAccountService,
  ) {}

  createBankAccount = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.auth.user.id;
      const creatorId = validate(getCreatorId, req.params.id);
      const data = validate(createCreatorBankAccountDto, req.body);

      const bankAccount =
        await this.creatorBankAccountService.createBankAccount(
          creatorId,
          data,
        );

      return sendSuccess(res, "Bank account added", bankAccount, 201);
    },
  );

  getBankAccount = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const creatorId = validate(getCreatorId, req.params.id);

      const bankAccount =
        await this.creatorBankAccountService.getBankAccount(
          creatorId,
        );

      return sendSuccess(res, "Bank account retrieved", bankAccount);
    },
  );

  updateBankAccount = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const creatorId = validate(getCreatorId, req.params.id);
      const data = validate(createCreatorBankAccountDto, req.body);

      const bankAccount =
        await this.creatorBankAccountService.updateBankAccount(
          creatorId,
          data,
        );

      return sendSuccess(res, "Bank account updated", bankAccount);
    },
  );
}
