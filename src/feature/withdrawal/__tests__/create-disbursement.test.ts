import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { authenticate } from "../../../../tests/helpers/auth.helper";
import { createTestCreator } from "@/feature/creator/__tests__/helpers/create-test-creator";
import { createTestCreatorBalance } from "@/feature/donation/__tests__/helpers/create-test-creator-balance";
import { createTestCreatorBankAccount } from "@/feature/creator/__tests__/helpers/create-test-creator-bank-account";
import type { CreateWithdrawalDto } from "../withdrawal.dto";
import { injectBalanceToCreator } from "../helpers/inject-balance-to-creator";

describe("create-disbursement", () => {
  let user: ReturnType<typeof request.agent>;
  let creatorId: string;
  let payload: CreateWithdrawalDto;

  beforeAll(async () => {
    const { agent, userId } = await authenticate();

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
