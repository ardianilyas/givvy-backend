import { db } from "@/shared/db";
import type { Creator } from "./creator.type";
import { creatorBalances, creators } from "@/shared/db/schemas";
import { asc, eq } from "drizzle-orm";
import { NotFoundError } from "@/shared/errors/not-found";
import { CREATOR_JOBS, CREATOR_NOT_FOUND, USER_ALREADY_HAVE_CREATOR_ACCOUNT_FORBIDDEN, USERNAME_ALREADY_TAKEN } from "./creator.constant";
import type { CreateCreatorDto, UpdateCreatorDto } from "./creator.dto";
import { ConflictError } from "@/shared/errors/conflict";
import { AppError } from "@/shared/errors/app-error";
import { ForbiddenError } from "@/shared/errors/forbidden";
import { CreatorPolicy } from "./creator.policy";
import { addDays } from "date-fns";
import { recipient, resend } from "@/shared/config/resend";
import { env } from "@/shared/config/env";
import { BadRequestError } from "@/shared/errors/bad-request";
import { creatorQueue } from "./queue/creator.queue";
import CreatorWelcomeEmail from "./emails/CreatorWelcomeEmail";
import { randomBytes } from "node:crypto";

export class CreatorService {
  getCreators(): Promise<Creator[]> {
    return db.select().from(creators).where(eq(creators.isActive, true)).orderBy(asc(creators.username));
  }

  async getCreator(username: string): Promise<Creator> {
    const creator = await this.getCreatorByUsername(username);

    if (!creator) throw new NotFoundError(CREATOR_NOT_FOUND);

    return creator;
  }

  async createCreator(data: CreateCreatorDto, userId: string, email: string): Promise<Creator> {
    // ensure user doesn't have creator account
    const isUserAlreadyHaveCreatorAccount = await this.checkIsUserAlreadyHaveCreatorAccount(userId);

    if (isUserAlreadyHaveCreatorAccount) throw new ForbiddenError(USER_ALREADY_HAVE_CREATOR_ACCOUNT_FORBIDDEN);

    // ensure username is available
    const creator = await this.getCreatorByUsername(data.username);

    if (creator) throw new ConflictError(USERNAME_ALREADY_TAKEN);

    // insert creator data
    const alertToken = randomBytes(32).toString("base64url");
    const newCreator = await db.transaction(async (tx) => {
      const [newCreator] = await tx.insert(creators).values({ ...data, userId, alertToken }).returning();

      if (!newCreator) throw new AppError("Failed to create creator, try again");

      await tx.insert(creatorBalances).values({
        creatorId: newCreator.id,
        balance: 0
      });

      return newCreator;
    });

    // send welcome creator email queue
    await creatorQueue.add(CREATOR_JOBS.SEND_WELCOME_CREATOR_EMAIL, {
      type: CREATOR_JOBS.SEND_WELCOME_CREATOR_EMAIL,
      to: email,
      subject: "Welcome to Givvy as Creator",
      username: newCreator.username,
    });

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

  async generateAlertToken(id: string, userId: string) {
    const authorId = await this.getCreatorByIdAndReturnUserId(id);

    CreatorPolicy.canGenerateAlertToken({
      authorId,
      userId
    });

    const alertToken = randomBytes(32).toString("base64url");

    const [creator] = await db.update(creators).set({ alertToken }).where(eq(creators.id, id)).returning();

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

  async sendWelcomeEmailToCreator(email: string, subject: string, username: string): Promise<string> {
    const to = recipient(email);

    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      react: CreatorWelcomeEmail({ username }),
    });

    if (error) throw new BadRequestError(error.message);

    return data.id
  }
}
