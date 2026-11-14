import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { authenticate } from "../../../../../tests/helpers/auth.helper";
import { createTestCreator } from "../helpers/create-test-creator";
import app from "@/app";
import {
  CREATOR_SUCCESS_MESSAGE,
  CREATOR_TEST_ROUTE,
} from "../../creator.constant";
import {
  ERROR_MESSAGE,
  ERROR_STATUS_CODE,
} from "@/shared/constants/error.constant";

describe("verify-creator", () => {
  let user: ReturnType<typeof request.agent>;
  let admin: ReturnType<typeof request.agent>;
  let id: string;

  beforeAll(async () => {
    const { agent: agentAdmin } = await authenticate("admin");
    const { agent, userId } = await authenticate();

    user = agent;
    admin = agentAdmin;

    const creator = await createTestCreator(userId);
    id = creator.id;
  });

  it("should return 401 when user is unauthorized", async () => {
    const res = await request(app).patch(CREATOR_TEST_ROUTE.VERIFY_CREATOR(id));

    expect(res.status).toBe(ERROR_STATUS_CODE.UNAUTHORIZED);
    expect(res.body.message).toBe(ERROR_MESSAGE.UNAUTHORIZED);
  });

  it("should return 403 when user is not admin", async () => {
    const res = await user.patch(CREATOR_TEST_ROUTE.VERIFY_CREATOR(id));

    expect(res.status).toBe(ERROR_STATUS_CODE.FORBIDDEN);
    expect(res.body.message).toBe(ERROR_MESSAGE.FORBIDDEN);
  });

  it("should return 200 when admin verify creator", async () => {
    const res = await admin.patch(CREATOR_TEST_ROUTE.VERIFY_CREATOR(id));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(CREATOR_SUCCESS_MESSAGE.VERIFY_CREATOR);
    expect(res.body.data).toBeDefined();
  });
});
