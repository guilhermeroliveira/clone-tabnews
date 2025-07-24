import orchestrator from "tests/orchestrator";

import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  const testURL = "http://localhost:3000/api/v1/users/";

  const baseRequest = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  describe("Anonymous User", () => {
    test("With exact case match", async () => {
      const user = {
        username: "exactmatch",
        email: "exactmatch@test.com",
        password: "test",
      };

      const createResponse = await fetch(testURL, {
        ...{
          ...baseRequest,
          method: "POST",
        },
        body: JSON.stringify({
          ...user,
        }),
      });
      expect(createResponse.status).toBe(201);

      const getResponse = await fetch(testURL + user.username, {
        ...baseRequest,
      });
      expect(getResponse.status).toBe(200);

      const getResponseBody = await getResponse.json();
      expect(getResponseBody).toEqual({
        id: getResponseBody.id,
        ...user,
        password: getResponseBody.password,
        created_at: getResponseBody.created_at,
        updated_at: getResponseBody.updated_at,
      });

      expect(uuidVersion(getResponseBody.id)).toEqual(4);
      expect(Date.parse(getResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(getResponseBody.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      const user = {
        username: "CaseMismatch",
        email: "case.mismatch@test.com",
        password: "test",
      };

      const createResponse = await fetch(testURL, {
        ...{
          ...baseRequest,
          method: "POST",
        },
        body: JSON.stringify({
          ...user,
        }),
      });
      expect(createResponse.status).toBe(201);

      const getResponse = await fetch(testURL + "casemismatch", {
        ...baseRequest,
      });
      expect(getResponse.status).toBe(200);

      const getResponseBody = await getResponse.json();
      expect(getResponseBody).toEqual({
        id: getResponseBody.id,
        ...user,
        password: getResponseBody.password,
        created_at: getResponseBody.created_at,
        updated_at: getResponseBody.updated_at,
      });

      expect(uuidVersion(getResponseBody.id)).toEqual(4);
      expect(Date.parse(getResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(getResponseBody.updated_at)).not.toBeNaN();
    });

    test("With non-existent username", async () => {
      const response = await fetch(testURL + "dontexists", {
        ...baseRequest,
      });
      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "The given username was not found.",
        action: "Check the username and try again.",
        status_code: 404,
      });
    });
  });
});
