import { asyncHandler } from "@/shared/utils/async-handler";
import type { CreatorService } from "../services/creator.service";
import type { Request, Response } from "express";
import { sendSuccess } from "@/shared/utils/response";
import { validate } from "@/shared/utils/validate";
import { createCreatorDto, getCreatorById, getCreatorByUsername, updateCreatorDto } from "../dto/creator.dto";
import type { AuthenticatedRequest } from "@/shared/types";
import { CREATOR_SUCCESS_MESSAGE } from "../creator.constant";
import { logger } from "@/shared/lib/logger";

export class CreatorController {
  constructor(private readonly creatorService: CreatorService) {}

  getCreators = asyncHandler(async (req: Request, res: Response) => {
    const creators = await this.creatorService.getCreators();
    return sendSuccess(res, CREATOR_SUCCESS_MESSAGE.GET_CREATORS, creators);
  });

  getCreatorByUsername = asyncHandler(async (req: Request, res: Response) => {
    const username = validate(getCreatorByUsername, req.params.username);
    const creator = await this.creatorService.getCreator(username);

    return sendSuccess(res, CREATOR_SUCCESS_MESSAGE.GET_CREATOR, creator);
  });

  createCreator = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const data = validate(createCreatorDto, req.body);
    const user = req.auth.user;
    const creator = await this.creatorService.createCreator(data, user.id, user.email);

    req.log.info(
      {
        action: "creator.created",
        data: creator
      },
      "A new creator registered"
    );

    return sendSuccess(res, CREATOR_SUCCESS_MESSAGE.CREATE_CREATOR, creator, 201);
  });

  updateCreator = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = validate(getCreatorById, req.params.id);
    const data = validate(updateCreatorDto, req.body);
    const creator = await this.creatorService.updateCreator(data, id, req.auth.user.id);

    return sendSuccess(res, CREATOR_SUCCESS_MESSAGE.UPDATE_CREATOR, creator);
  });

  verifyCreator = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = validate(getCreatorById, req.params.id);
    const creator = await this.creatorService.verifyCreator(id);

    return sendSuccess(res, CREATOR_SUCCESS_MESSAGE.VERIFY_CREATOR, creator);
  });

  generateAlertToken = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = validate(getCreatorById, req.params.id);
    const creator = await this.creatorService.generateAlertToken(id, req.auth.user.id);

    return sendSuccess(res, CREATOR_SUCCESS_MESSAGE.GENERATE_ALERT_TOKEN, creator);
  });
}
