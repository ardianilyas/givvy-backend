import { db } from "@/shared/db";
import type { Creator } from "./creator.type";
import { creators } from "@/shared/db/schemas";
import { asc, eq } from "drizzle-orm";
import { NotFoundError } from "@/shared/errors/not-found";
import { CREATOR_NOT_FOUND, USER_ALREADY_HAVE_CREATOR_ACCOUNT_FORBIDDEN, USERNAME_ALREADY_TAKEN } from "./creator.constant";
import type { CreateCreatorDto, UpdateCreatorDto } from "./creator.dto";
import { ConflictError } from "@/shared/errors/conflict";
import { AppError } from "@/shared/errors/app-error";
import { ForbiddenError } from "@/shared/errors/forbidden";
import { CreatorPolicy } from "./creator.policy";
import { addDays } from "date-fns";

export class CreatorService {
  getCreators(): Promise<Creator[]> {
    return db.select().from(creators).where(eq(creators.isActive, true)).orderBy(asc(creators.username));
  }

  async getCreator(username: string): Promise<Creator> {
    const creator = await this.getCreatorByUsername(username);

    if (!creator) throw new NotFoundError(CREATOR_NOT_FOUND);

    return creator;
  }

  async createCreator(data: CreateCreatorDto, userId: string): Promise<Creator> {
    // ensure user doesn't have creator account
    const isUserAlreadyHaveCreatorAccount = await this.checkIsUserAlreadyHaveCreatorAccount(userId);

    if (isUserAlreadyHaveCreatorAccount) throw new ForbiddenError(USER_ALREADY_HAVE_CREATOR_ACCOUNT_FORBIDDEN);

    // ensure username is available
    const creator = await this.getCreatorByUsername(data.username);

    if (creator) throw new ConflictError(USERNAME_ALREADY_TAKEN);

    // insert creator data
    const [newCreator] = await db.insert(creators).values({ ...data, userId }).returning();

    if (!newCreator) throw new AppError("Failed to create creator, try again");

    return newCreator;
  }

  async updateCreator(data: UpdateCreatorDto, id: string, userId: string): Promise<Creator> {
    const authorId = await this.getCreatorByIdAndReturnUserId(id);

    CreatorPolicy.canUpdate({
      userId,
      authorId
    });

    const [updatedCreator] = await db.update(creators).set(data).where(eq(creators.id, id)).returning();

    if (!updatedCreator) throw new NotFoundError(CREATOR_NOT_FOUND);

    return updatedCreator;
  }

  async verifyCreator(id: string): Promise<Creator> {
    const verifiedUntil = addDays(new Date(), 30);

    const [creator] = await db.update(creators).set({
      isVerified: true,
      verifiedUntil
    }).where(eq(creators.id, id)).returning();

    if (!creator) throw new NotFoundError(CREATOR_NOT_FOUND);

    return creator;
  }

  private async getCreatorByUsername(username: string): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.username, username)).limit(1);

    return creator;
  }

  private async getCreatorByIdAndReturnUserId(id: string): Promise<string> {
    const [creator] = await db.select().from(creators).where(eq(creators.id, id)).limit(1);

    if (!creator) throw new NotFoundError(CREATOR_NOT_FOUND);

    return creator.userId;
  }

  private async checkIsUserAlreadyHaveCreatorAccount(userId: string): Promise<boolean> {
    const [creator] = await db.select().from(creators).where(eq(creators.userId, userId)).limit(1);

    if (!creator) return false;

    return !!creator;
  }
}
