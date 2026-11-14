import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { authenticate } from "../../../../../tests/helpers/auth.helper";
import { createTestCreator } from "../helpers/create-test-creator";
import app from "@/app";
import {
  CREATOR_NOT_FOUND,
  CREATOR_POLICY_ERROR_MESSAGE,
  CREATOR_SUCCESS_MESSAGE,
  CREATOR_TEST_ROUTE,
} from "../../creator.constant";
import {
  AUTH_MESSAGE,
  AUTH_STATUS_CODE,
} from "@/shared/constants/auth.constants";
import { INVALID_UUID } from "@/shared/constants/test.constant";
import { ERROR_STATUS_CODE } from "@/shared/constants/error.constant";

describe("generate-alert-token test", () => {
  let user: ReturnType<typeof request.agent>;
  let user2: ReturnType<typeof request.agent>;
  let creatorId: string;

  beforeAll(async () => {
    const { agent, userId } = await authenticate();
    const { agent: agent2 } = await authenticate();

    const creator = await createTestCreator(userId);
    creatorId = creator.id;

    user = agent;
    user2 = agent2;
  });

  it("should return 401 when user is unauthorized", async () => {
    const res = await request(app).patch(
      CREATOR_TEST_ROUTE.GENERATE_ALERT_TOKEN(creatorId),
    );

    expect(res.status).toBe(AUTH_STATUS_CODE.UNAUTHORIZED);
    expect(res.body.message).toBe(AUTH_MESSAGE.UNAUTHORIZED);
  });

  it("should return 403 when user is not the owner", async () => {
    const res = await user2.patch(
      CREATOR_TEST_ROUTE.GENERATE_ALERT_TOKEN(creatorId),
    );

    expect(res.status).toBe(AUTH_STATUS_CODE.FORBIDDEN);
    expect(res.body.message).toBe(
      CREATOR_POLICY_ERROR_MESSAGE.GENERATE_ALERT_TOKEN,
    );
  });

  it("should return 404 when id not found", async () => {
    const res = await user.patch(
      CREATOR_TEST_ROUTE.GENERATE_ALERT_TOKEN(INVALID_UUID),
    );

    expect(res.status).toBe(ERROR_STATUS_CODE.NOT_FOUND);
    expect(res.body.message).toBe(CREATOR_NOT_FOUND);
  });

  it("should return 200 when alert token generated", async () => {
    const res = await user.patch(
      CREATOR_TEST_ROUTE.GENERATE_ALERT_TOKEN(creatorId),
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(CREATOR_SUCCESS_MESSAGE.GENERATE_ALERT_TOKEN);
    expect(res.body.data.alertToken).not.toBeNull();
  });
});
