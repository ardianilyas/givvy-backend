import app from "@/server";
import { faker } from "@faker-js/faker";
import request from "supertest";

export async function seedUsers(length: number = 1) {
  const agent = request.agent(app);

  for (let i = 0; i < length; i++) {
    const user = {
      name: faker.internet.username(),
      email: faker.internet.email(),
      password: "developer"
    }

    await agent.post("/api/auth/sign-up/email").send(user);
  }

  return;
}
