// API-003: Reject requests missing required case query parameters.
import { describe, expect, it } from "vitest";
import request from "supertest";
import createApp from "../app";

describe("API-003 required request parameters", () => {
  it("returns 400 when theme_id or difficulty is missing", async () => {
    const app = createApp();
    const missingBoth = await request(app).get("/api/cases");
    const missingDifficulty = await request(app)
      .get("/api/cases")
      .query({ theme_id: "507f1f77bcf86cd799439011" });

    expect(missingBoth.status).toBe(400);
    expect(missingBoth.body.message).toBe("A valid theme_id and difficulty are required.");
    expect(missingDifficulty.status).toBe(400);
    expect(missingDifficulty.body.message).toBe("A valid theme_id and difficulty are required.");
  });
});
