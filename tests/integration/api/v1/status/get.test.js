import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous User", () => {
    test("Fetching current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const responseBodyDependencies = responseBody.dependencies;
      expect(responseBodyDependencies.database).toBeDefined();

      const dependenciesDatabase = responseBodyDependencies.database;
      expect(dependenciesDatabase.version).toBe("16.3");
      expect(dependenciesDatabase.max_connections).toBe(100);
      expect(dependenciesDatabase.opened_connections).toBe(1);

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);
    });
  });
});
