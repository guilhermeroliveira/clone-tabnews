import database from "infra/database";
import { UnauthorizedError } from "infra/errors/errors";
import crypto from "node:crypto";

const EXPIRATION_IN_MILLIS = 60 * 60 * 24 * 30 * 1000; // 30 days

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLIS);

  const newSession = await runInsertQuery(token, expiresAt, userId);
  return newSession;

  async function runInsertQuery(token, expiresAt, userId) {
    const result = await database.query({
      text: `
        INSERT INTO
          session (token, expires_at, user_id)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
      `,
      values: [token, expiresAt, userId],
    });

    return result.rows[0];
  }
}

async function findOneValidByToken(sessionToken) {
  const session = await runSelectQuery(sessionToken);

  async function runSelectQuery(sessionToken) {
    const result = await database.query({
      text: `
        SELECT
          *
        FROM
          session
        WHERE
          token = $1 AND
          expires_at > NOW()
        LIMIT 1
      `,
      values: [sessionToken],
    });

    if (result.rowCount === 0) {
      throw new UnauthorizedError({
        message: "User doesn't have an active session",
        action: "Check if the user is logged in and try again.",
      });
    }

    return result.rows[0];
  }

  return session;
}

async function renew(sessionId) {
  const session = await runUpdateQuery(sessionId);

  async function runUpdateQuery(sessionId) {
    const newExpiresAt = new Date(Date.now() + EXPIRATION_IN_MILLIS);

    const result = await database.query({
      text: `
        UPDATE
          session
        SET
          expires_at = $2,
          updated_at = NOW()
        WHERE
          id = $1
        RETURNING
          *
      `,
      values: [sessionId, newExpiresAt],
    });

    if (result.rowCount === 0) {
      throw new UnauthorizedError({
        message: "User doesn't have an active session",
        action: "Check if the user is logged in and try again.",
      });
    }

    return result.rows[0];
  }

  return session;
}

const session = {
  create,
  findOneValidByToken,
  renew,
  EXPIRATION_IN_MILLIS,
};

export default session;
