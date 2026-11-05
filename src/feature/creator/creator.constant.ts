export const CREATOR_NOT_FOUND = "Creator not found";
export const USER_ALREADY_HAVE_CREATOR_ACCOUNT_FORBIDDEN = "You're already have creator account";
export const USERNAME_ALREADY_TAKEN = "Username already taken";

export const CREATOR_SUCCESS_MESSAGE = {
  GET_CREATORS: "Creator list",
  GET_CREATOR: "Creator data",
  CREATE_CREATOR: "Creator created",
  UPDATE_CREATOR: "Creator updated",
}

export const CREATOR_BASE_URL = "/api/creators";

export const CREATOR_TEST_ROUTE = {
  GET_CREATORS: `${CREATOR_BASE_URL}`,
  GET_CREATOR_BY_USERNAME: (username: string) => `${CREATOR_BASE_URL}/${username}`,
  CREATE_CREATOR: `${CREATOR_BASE_URL}`,
  UPDATE_CREATOR: (id: string) => `${CREATOR_BASE_URL}/${id}`,
}
