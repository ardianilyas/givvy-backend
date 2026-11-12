import { faker } from "@faker-js/faker";
import type { CreateCreatorDto } from "../../creator.dto";
import { db } from "@/shared/db";
import { creators } from "@/shared/db/schemas";
import type { Creator } from "../../creator.type";
import { randomBytes } from "node:crypto";

export async function createTestCreator(userId: string): Promise<Creator> {
  const alertToken = randomBytes(32).toString("base64url");

  const data: CreateCreatorDto = {
    username: faker.internet.username(),
    description: faker.lorem.sentence(),
    displayName: faker.internet.displayName(),
  }

  const [creator] = await db.insert(creators).values({ ...data, userId, alertToken }).returning();

  if (!creator) throw new Error("Failed to create creator");

  return creator;
}
