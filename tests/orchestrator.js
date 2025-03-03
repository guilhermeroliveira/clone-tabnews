import retry from "async-retry";
import database from "infra/database";
import migrator from "model/migrator";

async function waitForAllServices() {
  await waitForWebServer();
}

async function waitForWebServer() {
  const fetchStatus = async () => {
    const response = await fetch("http://localhost:3000/api/v1/status");
    if (!response.ok) {
      throw new Error();
    }
  };

  return retry(fetchStatus, {
    retries: 100,
    maxTimeout: 1000,
  });
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
};

export default orchestrator;
