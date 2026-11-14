import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { authenticate } from "../../../../../tests/helpers/auth.helper";
import { createTestCreator } from "../helpers/create-test-creator";
import app from "@/app";
import { CREATOR_NOT_FOUND, CREATOR_TEST_ROUTE } from "../../creator.constant";

describe("get-creator", () => {
  let user: ReturnType<typeof request.agent>;
  let username: string;
  
  beforeAll(async () => {
    const { agent, userId } = await authenticate();

    user = agent;

    const creator = await createTestCreator(userId);
    username = creator.username;
  });

  it("should return 404 when username not found", async () => {
    const res = await request(app).get(CREATOR_TEST_ROUTE.GET_CREATOR_BY_USERNAME("invalid-username"));

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(CREATOR_NOT_FOUND);
  });

  it("should return 200 when user is unauthorized", async () => {
    const res = await request(app).get(CREATOR_TEST_ROUTE.GET_CREATOR_BY_USERNAME(username));

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data).toBeInstanceOf(Object);
  });

  it("should return 200 when user is authorized", async () => {
    const res = await user.get(CREATOR_TEST_ROUTE.GET_CREATOR_BY_USERNAME(username));

    console.log(res.status, res.body);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data).toBeInstanceOf(Object);
  });
});
