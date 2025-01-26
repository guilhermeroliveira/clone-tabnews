import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("GET /api/v1/status", () => {
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

describe("POST /api/v1/status", () => {
  describe("Anonymous User", () => {
    test("Calling unallowed method", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status", {
        method: "POST",
      });
      expect(response.status).toBe(405);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "MethodNotAllowedError",
        message: "Method not allowed for this resource.",
        action: "Check if the HTTP method is valid for this resource.",
        status_code: 405,
      });
    });
  });
});
