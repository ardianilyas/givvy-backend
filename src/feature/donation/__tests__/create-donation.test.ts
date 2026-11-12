import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { authenticate } from "../../../../tests/helpers/auth.helper";
import { createTestCreator } from "@/feature/creator/__tests__/helpers/create-test-creator";
import type { CreateDonationDto } from "../donation.dto";
import app from "@/app";
import { DONATION_TEST_ROUTE } from "../donation.constant";
import { AUTH_MESSAGE, AUTH_STATUS_CODE } from "@/shared/constants/auth.constants";
import { ERROR_MESSAGE, ERROR_STATUS_CODE } from "@/shared/constants/error.constant";
import { createTestCreatorBalance } from "./helpers/create-test-creator-balance";

describe("create-donation", () => {
  let user: ReturnType<typeof request.agent>;
  let payload: CreateDonationDto;

  beforeAll(async () => {
    const { agent } = await authenticate();
    const { userId } = await authenticate();

    const creator = await createTestCreator(userId);
    await createTestCreatorBalance(creator.id);

    user = agent;

    payload = {
      amount: 25000,
      creatorId: creator.id,
      message: "Hi!"
    }
  });

  it("should return 401 when user is unauthorized", async () => {
    const res = await request(app).post(DONATION_TEST_ROUTE.DONATE).send(payload);

    expect(res.status).toBe(AUTH_STATUS_CODE.UNAUTHORIZED);
    expect(res.body.message).toBe(AUTH_MESSAGE.UNAUTHORIZED);
  });

  it("should return 400 when data is invalid", async () => {
    const res = await user.post(DONATION_TEST_ROUTE.DONATE).send({});

    expect(res.status).toBe(ERROR_STATUS_CODE.BAD_REQUEST);
    expect(res.body.message).toBe(ERROR_MESSAGE.VALIDATION_ERROR);
    expect(res.body.errors).toBeDefined();
  });

  it("should return 201 when donation created and return payment url", async () => {
    const res = await user.post(DONATION_TEST_ROUTE.DONATE).send(payload);

    console.log(res.status, res.body);

    expect(res.status).toBe(201);
    expect(res.body.data).toBeInstanceOf(Object);
  });
});
