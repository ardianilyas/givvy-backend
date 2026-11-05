import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { authenticate } from "../../../../tests/helpers/auth.helper";
import app from "@/server";
import { CREATOR_TEST_ROUTE } from "../creator.constant";

describe("get-creators", () => {
  let user: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const { agent } = await authenticate();
    user = agent;
  });

  it("should return 200 when user is unauthorized", async () => {
    const res = await request(app).get(CREATOR_TEST_ROUTE.GET_CREATORS);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it("should return 200 when user is authorized", async () => {
    const res = await user.get(CREATOR_TEST_ROUTE.GET_CREATORS);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});
