import database from "infra/database";
import { ServiceError } from "infra/errors/errors";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";

const defaultMigrationOptions = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  dryRun: true,
  migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    });

    return pendingMigrations;
  } catch (error) {
    const serviceError = new ServiceError({
      message: "An error ocurred while running pending migrations.",
      cause: error,
    });
    throw serviceError;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });

    return migratedMigrations;
  } catch (error) {
    const serviceError = new ServiceError({
      message: "An error ocurred while running pending migrations.",
      cause: error,
    });
    throw serviceError;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
