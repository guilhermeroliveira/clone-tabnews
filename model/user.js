import database from "infra/database";
import { ConflictError } from "infra/errors/errors.js";

async function create(createUserData) {
  await validateUniqueEmail(createUserData.email);
  await validateUniqueUsername(createUserData.username);

  return runInsertQuery(createUserData);

  async function validateUniqueEmail(email) {
    const {
      rows: [{ count }],
    } = await database.query({
      text: `
      SELECT COUNT(id) FROM
        user_account
      WHERE
        LOWER(email) = LOWER($1)
    `,
      values: [email],
    });

    if (count > 0) {
      throw new ConflictError({
        message: "The given email already is registered.",
        action: "Use another email to proceed.",
      });
    }
  }

  async function validateUniqueUsername(username) {
    const {
      rows: [{ count }],
    } = await database.query({
      text: `
      SELECT COUNT(id) FROM
        user_account
      WHERE
        LOWER(username) = LOWER($1)
    `,
      values: [username],
    });

    if (count > 0) {
      throw new ConflictError({
        message: "The given username already is registered.",
        action: "Use another username to proceed.",
      });
    }
  }

  async function runInsertQuery(createUserData) {
    const result = await database.query({
      text: `
      INSERT INTO
        user_account (username, email, password)
      VALUES
        ($1, $2, $3)
      RETURNING 
        *
        ;`,
      values: [
        createUserData.username,
        createUserData.email.toLowerCase(),
        createUserData.password,
      ],
    });

    return result.rows[0];
  }
}

const user = {
  create,
};

export default user;
