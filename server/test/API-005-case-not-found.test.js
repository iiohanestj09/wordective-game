// API-005: Return 404 when no case matches a valid query.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import createApp from "../app";
const {
  connectApiTestDatabase,
  disconnectApiTestDatabase,
  getValidCaseQuery,
} = require("./apiTestHelpers");

describe("API-005 case not found", () => {
  beforeAll(connectApiTestDatabase);
  afterAll(disconnectApiTestDatabase);

  it("returns 404 when the requested valid case ID is not in that theme", async () => {
    const query = await getValidCaseQuery();
    const response = await request(createApp())
      .get("/api/cases")
      .query({
        theme_id: query.theme_id,
        difficulty: query.difficulty,
        case_id: "507f1f77bcf86cd799439011",
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("No story was found for this theme and difficulty.");
  });
});
