import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { authenticate } from "../../../../tests/helpers/auth.helper";
import type { UpdateCreatorDto } from "../creator.dto";
import { createTestCreator } from "./helpers/create-test-creator";
import app from "@/server";
import { CREATOR_NOT_FOUND, CREATOR_SUCCESS_MESSAGE, CREATOR_TEST_ROUTE } from "../creator.constant";
import { ERROR_MESSAGE, ERROR_STATUS_CODE } from "@/shared/constants/error.constant";
import { INVALID_UUID } from "@/shared/constants/test.constant";

describe("update-creator", () => {
  let user: ReturnType<typeof request.agent>;
  let id: string;
  let payload: UpdateCreatorDto;

  beforeAll(async () => {
    const { agent, userId } = await authenticate();
    user = agent;

    const creator = await createTestCreator(userId);
    id = creator.id;

    payload = {
      description: "Updated description"
    }
  })

  it("should return 401 when user is unauthorized", async () => {
    const res = await request(app).patch(CREATOR_TEST_ROUTE.UPDATE_CREATOR(id)).send(payload);

    expect(res.status).toBe(ERROR_STATUS_CODE.UNAUTHORIZED);
    expect(res.body.message).toBe(ERROR_MESSAGE.UNAUTHORIZED);
  });

  it("should return 404 when creator not found", async () => {
    const res = await user.patch(CREATOR_TEST_ROUTE.UPDATE_CREATOR(INVALID_UUID)).send(payload);

    expect(res.status).toBe(ERROR_STATUS_CODE.NOT_FOUND);
    expect(res.body.message).toBe(CREATOR_NOT_FOUND);
  });

  it("should return 200 when creator updated", async () => {
    const res = await user.patch(CREATOR_TEST_ROUTE.UPDATE_CREATOR(id)).send(payload);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(CREATOR_SUCCESS_MESSAGE.UPDATE_CREATOR);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.description).toBe(payload.description);
  });
});;
