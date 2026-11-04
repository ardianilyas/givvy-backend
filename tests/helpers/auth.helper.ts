import request from "supertest";
import { eq } from "drizzle-orm";
import type { UserRole } from "@/shared/types/express";
import app from "@/server";
import { db } from "@/shared/db";
import * as schema from "@/shared/db/schemas";
import { faker } from "@faker-js/faker";

export async function authenticate(role: UserRole = "user") {
  const agent = request.agent(app)

  const user = {
    name: faker.internet.username(),
    email: faker.internet.email(),
    password: "developer"
  }

  await agent
    .post("/api/auth/sign-up/email")
    .send(user)

  const [data] = await db.update(schema.user).set({ role }).where(eq(schema.user.email, user.email)).returning();

  if (!data) throw new Error("Failed to update user role");

  const userId = data.id;

  await agent
    .post("/api/auth/sign-in/email")
    .send({
      email: user.email,
      password: user.password
    });

  return {
    user,
    userId,
    agent
  }
}