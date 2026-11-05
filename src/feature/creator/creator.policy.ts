import { ForbiddenError } from "@/shared/errors/forbidden";
import { CREATOR_POLICY_ERROR_MESSAGE } from "./creator.constant";

type CreatorPolicyContext = {
  authorId: string;
  userId: string;
}

export const CreatorPolicy = {
  canUpdate(context: CreatorPolicyContext) {
    if (context.authorId !== context.userId) {
      throw new ForbiddenError(CREATOR_POLICY_ERROR_MESSAGE.UPDATE);
    }
  }
}
