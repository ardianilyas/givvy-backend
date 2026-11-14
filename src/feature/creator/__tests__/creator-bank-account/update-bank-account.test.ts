import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import type { CreateCreatorBankAccountDto } from "../../dto/creator-bank-account.dto";
import { authenticate } from "../../../../../tests/helpers/auth.helper";
import { createTestCreator } from "../helpers/create-test-creator";
import app from "@/app";
import { CREATOR_TEST_ROUTE } from "../../creator.constant";
import {
  AUTH_MESSAGE,
  AUTH_STATUS_CODE,
} from "@/shared/constants/auth.constants";
import {
  ERROR_MESSAGE,
  ERROR_STATUS_CODE,
} from "@/shared/constants/error.constant";
import { INVALID_UUID } from "@/shared/constants/test.constant";
import { createTestCreatorBankAccount } from "../helpers/create-test-creator-bank-account";

describe("update-bank-account", () => {
  let user: ReturnType<typeof request.agent>;
  let user2: ReturnType<typeof request.agent>;
  let creatorId: string;
  let payload: CreateCreatorBankAccountDto;

  beforeAll(async () => {
    const { agent, userId } = await authenticate();
    const { agent: agent2 } = await authenticate();

    const creator = await createTestCreator(userId);
    creatorId = creator.id;
    await createTestCreatorBankAccount(creatorId);

    payload = {
      accountName: "Ardian",
      accountNumber: "0000000000",
      bankCode: "BCA",
    };

    user = agent;
    user2 = agent2;
  });

  it("should return 401 when user is unauthorized", async () => {
    const res = await request(app)
      .patch(CREATOR_TEST_ROUTE.UPDATE_BANK_ACCOUNT(creatorId))
      .send(payload);

    expect(res.status).toBe(AUTH_STATUS_CODE.UNAUTHORIZED);
    expect(res.body.message).toBe(AUTH_MESSAGE.UNAUTHORIZED);
  });

  it("should return 400 when data is invalid", async () => {
    const res = await user
      .patch(CREATOR_TEST_ROUTE.UPDATE_BANK_ACCOUNT(creatorId))
      .send({});

    expect(res.status).toBe(ERROR_STATUS_CODE.BAD_REQUEST);
    expect(res.body.message).toBe(ERROR_MESSAGE.VALIDATION_ERROR);
    expect(res.body.errors).toBeDefined();
  });

  it("should return 404 when creator id is invalid", async () => {
    const res = await user
      .patch(CREATOR_TEST_ROUTE.UPDATE_BANK_ACCOUNT(INVALID_UUID))
      .send(payload);

    expect(res.status).toBe(ERROR_STATUS_CODE.NOT_FOUND);
    expect(res.body.message).toBe("Bank account not found");
  });

  it("should return 200 when data updated", async () => {
    const res = await user
      .patch(CREATOR_TEST_ROUTE.UPDATE_BANK_ACCOUNT(creatorId))
      .send(payload);

    console.log(res.status, res.body);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Bank account updated");
    expect(res.body.data).toBeDefined();
  });
});
