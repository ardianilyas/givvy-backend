import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { authenticate } from "../../../../../tests/helpers/auth.helper";
import { createTestCreator } from "../helpers/create-test-creator";
import type { CreateCreatorBankAccountDto } from "../../dto/creator-bank-account.dto";
import app from "@/app";
import { CREATOR_TEST_ROUTE } from "../../creator.constant";
import {
  ERROR_MESSAGE,
  ERROR_STATUS_CODE,
} from "@/shared/constants/error.constant";

describe("create-creator-bank-account", () => {
  let user: ReturnType<typeof request.agent>;
  let creatorId: string;
  let payload: CreateCreatorBankAccountDto;

  beforeAll(async () => {
    const { agent, userId } = await authenticate();

    const creator = await createTestCreator(userId);
    creatorId = creator.id;

    payload = {
      accountName: "Ardian Ilyas",
      accountNumber: "1111444414",
      bankCode: "BCA",
    };

    user = agent;
  });

  it("should return 401 when user is unauthorized", async () => {
    const res = await request(app)
      .post(CREATOR_TEST_ROUTE.CREATE_BANK_ACCOUNT(creatorId))
      .send(payload);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe(ERROR_MESSAGE.UNAUTHORIZED);
  });

  it("should return 400 when data is invalid", async () => {
    const res = await user
      .post(CREATOR_TEST_ROUTE.CREATE_BANK_ACCOUNT(creatorId))
      .send({});

    expect(res.status).toBe(ERROR_STATUS_CODE.BAD_REQUEST);
    expect(res.body.message).toBe(ERROR_MESSAGE.VALIDATION_ERROR);
    expect(res.body.errors).toBeDefined();
  });

  it("should return 200 when data is valid and created", async () => {
    const res = await user
      .post(CREATOR_TEST_ROUTE.CREATE_BANK_ACCOUNT(creatorId))
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
  });
});
