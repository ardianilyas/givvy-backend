import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { authenticate } from "../../../../tests/helpers/auth.helper";
import { createTestCreator } from "@/feature/creator/__tests__/helpers/create-test-creator";
import { createTestCreatorBalance } from "@/feature/donation/__tests__/helpers/create-test-creator-balance";
import { createTestCreatorBankAccount } from "@/feature/creator/__tests__/helpers/create-test-creator-bank-account";
import type { CreateWithdrawalDto } from "../withdrawal.dto";
import { injectBalanceToCreator } from "../helpers/inject-balance-to-creator";
import app from "@/app";
import {
  CREATOR_NOT_FOUND,
  INSUFFICIENT_BALANCE,
  WITHDRAWAL_ROUTE_TEST,
} from "../withdrawal.constant";
import {
  AUTH_MESSAGE,
  AUTH_STATUS_CODE,
} from "@/shared/constants/auth.constants";
import { ERROR_STATUS_CODE } from "@/shared/constants/error.constant";

describe("create-disbursement", () => {
  let user: ReturnType<typeof request.agent>;
  let user2: ReturnType<typeof request.agent>;
  let creatorId: string;
  let payload: CreateWithdrawalDto;

  beforeAll(async () => {
    const { agent, userId } = await authenticate();
    const { agent: agent2 } = await authenticate();

    const creator = await createTestCreator(userId);

    creatorId = creator.id;

    await createTestCreatorBalance(creatorId);
    await injectBalanceToCreator(creatorId, 200000);
    const account = await createTestCreatorBankAccount(creatorId);

    payload = {
      amount: 50000,
      bankAccountId: account.id,
    };

    user = agent;
    user2 = agent2;
  });

  it("should return 401 when user is unauthorized", async () => {
    const res = await request(app)
      .post(WITHDRAWAL_ROUTE_TEST.WITHDRAW(creatorId))
      .send(payload);

    console.log(res.status, res.body);

    expect(res.status).toBe(AUTH_STATUS_CODE.UNAUTHORIZED);
    expect(res.body.message).toBe(AUTH_MESSAGE.UNAUTHORIZED);
  });

  it("should return 404 when creatorId is invalid or user not the owner", async () => {
    const res = await user2
      .post(WITHDRAWAL_ROUTE_TEST.WITHDRAW(creatorId))
      .send(payload);

    expect(res.status).toBe(ERROR_STATUS_CODE.NOT_FOUND);
    expect(res.body.message).toBe(CREATOR_NOT_FOUND);
  });

  it("should return 422 when balance less than withdraw amount", async () => {
    const res = await user
      .post(WITHDRAWAL_ROUTE_TEST.WITHDRAW(creatorId))
      .send({ ...payload, amount: 300000 });

    expect(res.status).toBe(ERROR_STATUS_CODE.UNPROCESSABLE_ENTITY);
    expect(res.body.message).toBe(INSUFFICIENT_BALANCE);
  });

  it("should return 201 when disbursement successfully sent", async () => {
    const res = await user
      .post(`/api/withdrawals/${creatorId}/withdraw`)
      .send(payload);

    console.log(res.status, res.body);

    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
  });
});
