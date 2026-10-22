// API-008: Verify returned card vocabulary links resolve to word and meaning.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import createApp from "../app";
const {
  connectApiTestDatabase,
  disconnectApiTestDatabase,
  getValidCaseQuery,
} = require("./apiTestHelpers");

describe("API-008 card vocabulary data", () => {
  beforeAll(connectApiTestDatabase);
  afterAll(disconnectApiTestDatabase);

  it("returns a vocabulary array with word and meaning for each case card", async () => {
    const query = await getValidCaseQuery();
    const response = await request(createApp())
      .get("/api/cases")
      .query({
        theme_id: query.theme_id,
        difficulty: query.difficulty,
        case_id: query.case_id,
      });

    expect(response.status).toBe(200);
    for (const card of [...response.body.cards, ...response.body.clues]) {
      expect(Array.isArray(card.vocabularies)).toBe(true);
      for (const vocabulary of card.vocabularies) {
        expect(vocabulary.word).toEqual(expect.any(String));
        expect(vocabulary.meaning).toEqual(expect.any(String));
      }
    }
  });
});
