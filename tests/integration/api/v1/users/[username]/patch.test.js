import password from "model/password";
import user from "model/user";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  const testURL = "http://localhost:3000/api/v1/users/";

  const baseRequest = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  };

  describe("Anonymous User", () => {
    test("With unique username", async () => {
      await orchestrator.createUser({
        username: "unique_username",
      });

      const response = await fetch(testURL + "unique_username", {
        ...baseRequest,
        body: JSON.stringify({
          username: "unique_username2",
        }),
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "unique_username2",
        email: responseBody.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      const createdAt = new Date(responseBody.created_at);
      const updatedAt = new Date(responseBody.updated_at);
      expect(updatedAt > createdAt).toBeTruthy();

      expect(uuidVersion(responseBody.id)).toEqual(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With unique email", async () => {
      const { username } = await orchestrator.createUser({
        email: "unique_email@test.com",
      });

      const response = await fetch(testURL + username, {
        ...baseRequest,
        body: JSON.stringify({
          email: "unique_email2@test.com",
        }),
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        email: "unique_email2@test.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      const createdAt = new Date(responseBody.created_at);
      const updatedAt = new Date(responseBody.updated_at);
      expect(updatedAt > createdAt).toBeTruthy();

      expect(uuidVersion(responseBody.id)).toEqual(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With new password", async () => {
      await orchestrator.createUser({
        username: "new_password",
        email: "new_password@test.com",
        password: "test",
      });

      const response = await fetch(testURL + "new_password", {
        ...baseRequest,
        body: JSON.stringify({
          password: "new_password",
        }),
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "new_password",
        email: "new_password@test.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      const createdAt = new Date(responseBody.created_at);
      const updatedAt = new Date(responseBody.updated_at);
      expect(updatedAt > createdAt).toBeTruthy();

      expect(uuidVersion(responseBody.id)).toEqual(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("new_password");
      const correctPasswordMatch = await password.compare("new_password", userInDatabase.password);
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare("test", userInDatabase.password);
      expect(incorrectPasswordMatch).toBe(false);
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

    test("With duplicated username", async () => {
      await orchestrator.createUser({
        username: "duplicated_username1",
      });

      await orchestrator.createUser({
        username: "duplicated_username2",
      });

      const response = await fetch(testURL + "duplicated_username1", {
        ...baseRequest,
        body: JSON.stringify({
          username: "duplicated_username2",
        }),
      });
      expect(response.status).toBe(409);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ConflictError",
        message: "The given username already is registered.",
        action: "Use another username to proceed.",
        status_code: 409,
      });
    });

    test("With duplicated email", async () => {
      const user1 = await orchestrator.createUser({
        email: "duplicated_email1@test.com",
      });

      await orchestrator.createUser({
        email: "duplicated_email2@test.com",
      });

      const response = await fetch(testURL + user1.username, {
        ...baseRequest,
        body: JSON.stringify({
          email: "duplicated_email2@test.com",
        }),
      });
      expect(response.status).toBe(409);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ConflictError",
        message: "The given email already is registered.",
        action: "Use another email to proceed.",
        status_code: 409,
      });
    });
  });
});
