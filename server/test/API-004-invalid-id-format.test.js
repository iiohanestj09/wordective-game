// API-004: Reject malformed theme_id and case_id values.
import { describe, expect, it } from "vitest";
import request from "supertest";
import createApp from "../app";

describe("API-004 invalid request ID format", () => {
  it("returns 400 for malformed theme_id or case_id", async () => {
    const app = createApp();
    const invalidTheme = await request(app)
      .get("/api/cases")
      .query({ theme_id: "not-an-object-id", difficulty: "Beginner" });
    const invalidCase = await request(app)
      .get("/api/cases")
      .query({
        theme_id: "507f1f77bcf86cd799439011",
        difficulty: "Beginner",
        case_id: "invalid",
      });

    expect(invalidTheme.status).toBe(400);
    expect(invalidCase.status).toBe(400);
  });
});
