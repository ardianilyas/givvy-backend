import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { authenticate } from "../../../../../tests/helpers/auth.helper";
import { createTestCreator } from "../helpers/create-test-creator";
import { createTestCreatorBankAccount } from "../helpers/create-test-creator-bank-account";
import { CREATOR_TEST_ROUTE } from "../../creator.constant";
import app from "@/app";
import { AUTH_MESSAGE, AUTH_STATUS_CODE } from "@/shared/constants/auth.constants";
import { INVALID_UUID } from "@/shared/constants/test.constant";
import { ERROR_STATUS_CODE } from "@/shared/constants/error.constant";

describe("get-bank-account", () => {
  let user: ReturnType<typeof request.agent>;
  let creatorId: string;

  beforeAll(async () => {
    const { agent, userId } = await authenticate();

    const creator = await createTestCreator(userId);
    creatorId = creator.id;
    await createTestCreatorBankAccount(creatorId);

    user = agent;
  })

  it("should return 401 when user is unauthorized", async () => {
    const res = await request(app).get(CREATOR_TEST_ROUTE.GET_BANK_ACCOUNT(creatorId));

    expect(res.status).toBe(AUTH_STATUS_CODE.UNAUTHORIZED);
    expect(res.body.message).toBe(AUTH_MESSAGE.UNAUTHORIZED);
  });

  it("should return 404 when creator id is invalid", async () => {
    const res = await user.get(CREATOR_TEST_ROUTE.GET_BANK_ACCOUNT(INVALID_UUID));

    expect(res.status).toBe(ERROR_STATUS_CODE.NOT_FOUND);
    expect(res.body.message).toBe("Bank account not found");
  });

  it("should return bank account data", async () => {
    const res = await user.get(CREATOR_TEST_ROUTE.GET_BANK_ACCOUNT(creatorId));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Bank account retrieved");
    expect(res.body.data).toBeDefined();
  });
});
