import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  const waitPromise = orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();

  await waitPromise;
});

describe("POST /api/v1/users", () => {
  const testURL = "http://localhost:3000/api/v1/users";

  const baseRequest = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  describe("Anonymous User", () => {
    test("With unique and valid data", async () => {
      const response = await fetch(testURL, {
        ...baseRequest,
        body: JSON.stringify({
          username: "username_test",
          email: "email@test.com",
          password: "test",
        }),
      });
      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "username_test",
        email: "email@test.com",
        password: "test",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toEqual(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With duplicated e-mail", async () => {
      const newUser = {
        username: "duplicated_email1",
        email: "duplicated_email@test.com",
        password: "test",
      };

      const response1 = await fetch(testURL, {
        ...baseRequest,
        body: JSON.stringify({
          ...newUser,
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch(testURL, {
        ...baseRequest,
        body: JSON.stringify({
          ...newUser,
          username: "duplicated_email2",
        }),
      });
      expect(response2.status).toBe(409);

      const responseBody = await response2.json();
      expect(responseBody).toEqual({
        name: "ConflictError",
        message: "The given email already is registered.",
        action: "Use another email to proceed.",
        status_code: 409,
      });
    });

    test("With duplicated username", async () => {
      const newUser = {
        username: "duplicated_username",
        email: "duplicated_username1@test.com",
        password: "test",
      };

      const response1 = await fetch(testURL, {
        ...baseRequest,
        body: JSON.stringify({
          ...newUser,
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch(testURL, {
        ...baseRequest,
        body: JSON.stringify({
          ...newUser,
          email: "duplicated_username2@test.com",
        }),
      });
      expect(response2.status).toBe(409);

      const responseBody = await response2.json();
      expect(responseBody).toEqual({
        name: "ConflictError",
        message: "The given username already is registered.",
        action: "Use another username to proceed.",
        status_code: 409,
      });
    });
  });
});
