import database from "infra/database";
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

const session = {
  create,
  EXPIRATION_IN_MILLIS,
};

export default session;
