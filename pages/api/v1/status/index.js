import controller from "infra/controller";
import database from "infra/database";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(getHandler);

async function getHandler(_, response) {
  const updatedAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersion = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionsResult = await database.query("SHOW max_connections;");
  const databaseMaxConnections = Number(databaseMaxConnectionsResult.rows[0].max_connections);

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenConnectionsResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1",
    values: [databaseName],
  });
  const databaseOpenConnections = databaseOpenConnectionsResult.rows[0].count;

  const databaseData = {
    version: databaseVersion,
    max_connections: databaseMaxConnections,
    opened_connections: databaseOpenConnections,
  };

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: databaseData,
    },
  });
}

export default router.handler(controller.errorHandlers);
