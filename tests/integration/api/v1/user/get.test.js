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

describe("GET /api/v1/user", () => {
  const testURL = "http://localhost:3000/api/v1/user";

  describe("Default User", () => {
    test("With valid session", async () => {
      const user = await orchestrator.createUser({
        username: "valid-session",
      });

      const createdSession = await orchestrator.createSession(user.id);

      const getResponse = await fetch(testURL, {
        headers: {
          Cookie: `session_id=${createdSession.token}`,
        },
      });
      expect(getResponse.status).toBe(200);

      const getResponseBody = await getResponse.json();
      expect(getResponseBody).toEqual({
        ...user,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString(),
        username: "valid-session",
      });

      expect(uuidVersion(getResponseBody.id)).toEqual(4);
      expect(Date.parse(getResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(getResponseBody.updated_at)).not.toBeNaN();

      const renewedSessionObject = await session.findOneValidByToken(createdSession.token);
      expect(renewedSessionObject.expires_at > createdSession.expires_at).toBe(true);
      expect(renewedSessionObject.updated_at > createdSession.updated_at).toBe(true);

      const parsedSetCookie = setCookieParser(getResponse, {
        map: true,
      });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: renewedSessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLIS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With session about to expire", async () => {
      const user = await orchestrator.createUser({
        username: "about-to-expire-session",
      });

      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLIS + 1000),
      });

      const createdSession = await orchestrator.createSession(user.id);

      jest.useRealTimers();

      const getResponse = await fetch(testURL, {
        headers: {
          Cookie: `session_id=${createdSession.token}`,
        },
      });
      expect(getResponse.status).toBe(200);

      const getResponseBody = await getResponse.json();
      expect(getResponseBody).toEqual({
        ...user,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString(),
        username: "about-to-expire-session",
      });

      expect(uuidVersion(getResponseBody.id)).toEqual(4);
      expect(Date.parse(getResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(getResponseBody.updated_at)).not.toBeNaN();

      const renewedSessionObject = await session.findOneValidByToken(createdSession.token);
      expect(renewedSessionObject.expires_at > createdSession.expires_at).toBe(true);
      expect(renewedSessionObject.updated_at > createdSession.updated_at).toBe(true);

      const parsedSetCookie = setCookieParser(getResponse, {
        map: true,
      });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: renewedSessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLIS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With nonexistent session", async () => {
      const nonexistentToken = crypto.randomBytes(48).toString("hex");

      const getResponse = await fetch(testURL, {
        headers: {
          Cookie: `session_id=${nonexistentToken}`,
        },
      });
      expect(getResponse.status).toBe(401);

      const getResponseBody = await getResponse.json();
      expect(getResponseBody).toEqual({
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

      const getResponse = await fetch(testURL, {
        headers: {
          Cookie: `session_id=${createdSession.token}`,
        },
      });
      expect(getResponse.status).toBe(401);

      const getResponseBody = await getResponse.json();
      expect(getResponseBody).toEqual({
        name: "UnauthorizedError",
        message: "User doesn't have an active session",
        action: "Check if the user is logged in and try again.",
        status_code: 401,
      });
    });
  });
});
