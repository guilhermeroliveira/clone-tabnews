import session from "model/session";
import crypto from "node:crypto";
import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("DELETE /api/v1/sessions", () => {
  const testURL = "http://localhost:3000/api/v1/sessions";

  describe("Default User", () => {
    test("With valid session", async () => {
      const user = await orchestrator.createUser({
        username: "valid-session",
      });

      const createdSession = await orchestrator.createSession(user.id);

      const response = await fetch(testURL, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${createdSession.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        user_id: createdSession.user_id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toEqual(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
      });
    });

    test("With nonexistent session", async () => {
      const nonexistentToken = crypto.randomBytes(48).toString("hex");

      const response = await fetch(testURL, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${nonexistentToken}`,
        },
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "User doesn't have an active session",
        action: "Check if the user is logged in and try again.",
        status_code: 401,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLIS),
      });

      const user = await orchestrator.createUser({
        username: "expired-session",
      });

      const createdSession = await orchestrator.createSession(user.id);

      jest.useRealTimers();

      const response = await fetch(testURL, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${createdSession.token}`,
        },
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "User doesn't have an active session",
        action: "Check if the user is logged in and try again.",
        status_code: 401,
      });

      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
      });
    });
  });
});
