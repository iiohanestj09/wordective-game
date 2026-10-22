// API-002: Return a case for a valid theme and difficulty.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import createApp from "../app";
const {
  connectApiTestDatabase,
  disconnectApiTestDatabase,
  getValidCaseQuery,
} = require("./apiTestHelpers");

describe("API-002 valid case response", () => {
  beforeAll(connectApiTestDatabase);
  afterAll(disconnectApiTestDatabase);

  it("returns the selected case, answer metadata, NPC cards, and clues", async () => {
    const query = await getValidCaseQuery();
    const response = await request(createApp())
      .get("/api/cases")
      .query({
        theme_id: query.theme_id,
        difficulty: query.difficulty,
        case_id: query.case_id,
      });

    expect(response.status).toBe(200);
    expect(response.body.case_id).toBe(query.case_id);
    expect(response.body.case_title).toEqual(expect.any(String));
    expect(response.body.story).toEqual(expect.any(String));
    expect(response.body.correct_suspect).toBe(query.correct_suspect);
    expect(response.body.logic_notes).toEqual(expect.any(String));
    expect(response.body.cards).toHaveLength(7);
    expect(response.body.clues).toHaveLength(3);
  });
});
