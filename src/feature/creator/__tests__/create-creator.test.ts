import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import type { CreateCreatorDto } from "../creator.dto";
import { authenticate } from "../../../../tests/helpers/auth.helper";
import app from "@/app";
import {
  CREATOR_SUCCESS_MESSAGE,
  CREATOR_TEST_ROUTE,
  USER_ALREADY_HAVE_CREATOR_ACCOUNT_FORBIDDEN,
} from "../creator.constant";
import { AUTH_MESSAGE } from "@/shared/constants/auth.constants";
import { createTestCreator } from "./helpers/create-test-creator";
import {
  ERROR_MESSAGE,
  ERROR_STATUS_CODE,
} from "@/shared/constants/error.constant";
import { db } from "@/shared/db";
import { creatorBalances } from "@/shared/db/schemas";
import { eq } from "drizzle-orm";

describe("create-creator", () => {
  let user: ReturnType<typeof request.agent>;
  let user2: ReturnType<typeof request.agent>;
  let payload: CreateCreatorDto;

  beforeAll(async () => {
    const { agent } = await authenticate();
    const { agent: agent2, userId } = await authenticate();

    await createTestCreator(userId);

    user = agent;
    user2 = agent2;

    payload = {
      username: "ardianilyas",
      displayName: "Ardian Ilyas",
      description: "Fullstack Developer",
    };
  });

  it("should return 401 when user is unauthorized", async () => {
    const res = await request(app)
      .post(CREATOR_TEST_ROUTE.CREATE_CREATOR)
      .send(payload);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe(AUTH_MESSAGE.UNAUTHORIZED);
  });

  it("should return 403 when user already have creator account", async () => {
    const res = await user2
      .post(CREATOR_TEST_ROUTE.CREATE_CREATOR)
      .send(payload);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(USER_ALREADY_HAVE_CREATOR_ACCOUNT_FORBIDDEN);
  });

  //  should test username already taken scenario

  it("should return 400 when data is invalid", async () => {
    const res = await user.post(CREATOR_TEST_ROUTE.CREATE_CREATOR).send({});

    expect(res.status).toBe(ERROR_STATUS_CODE.BAD_REQUEST);
    expect(res.body.message).toBe(ERROR_MESSAGE.VALIDATION_ERROR);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors).toBeInstanceOf(Object);
  });

  it("should return 201 when creator account created", async () => {
    const res = await user
      .post(CREATOR_TEST_ROUTE.CREATE_CREATOR)
      .send(payload);

    const creatorId = res.body.data.id;
    const [creatorBalance] = await db
      .select()
      .from(creatorBalances)
      .where(eq(creatorBalances.creatorId, creatorId))
      .limit(1);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe(CREATOR_SUCCESS_MESSAGE.CREATE_CREATOR);
    expect(res.body.data).toBeDefined();
    expect(creatorBalance).not.toBeUndefined();
  });
});
