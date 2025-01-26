import { ServiceError } from "infra/errors/errors";
import { Client } from "pg";

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: process.env.POSTGRES_USE_SSL === "true",
  });

  await client.connect();
  return client;
}

async function query(queryObject) {
  let client;

  try {
    client = await getNewClient();
    return await client.query(queryObject);
  } catch (error) {
    const serviceError = new ServiceError({
      message: "Error in the database connection or in the query.",
      cause: error,
    });
    throw serviceError;
  } finally {
    await client?.end();
  }
}

const database = {
  query,
  getNewClient,
};

export default database;
