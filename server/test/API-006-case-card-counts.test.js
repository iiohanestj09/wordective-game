// API-006: Verify every case-difficulty has exactly seven NPCs and three clues.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
const {
  connectApiTestDatabase,
  disconnectApiTestDatabase,
} = require("./apiTestHelpers");

describe("API-006 seeded card counts", () => {
  beforeAll(connectApiTestDatabase);
  afterAll(disconnectApiTestDatabase);

  it("has seven NPC cards and three clues for all 36 case-difficulties", async () => {
    const caseDifficulties = await mongoose.connection.db
      .collection("case_difficulties")
      .find({}, { projection: { case_diff_id: 1 } })
      .toArray();
    expect(caseDifficulties).toHaveLength(36);

    for (const { case_diff_id: caseDiffId } of caseDifficulties) {
      const [npcCount, clueCount] = await Promise.all([
        mongoose.connection.db.collection("cards").countDocuments({
          case_diff_id: caseDiffId,
          card_type: "NPC",
        }),
        mongoose.connection.db.collection("cards").countDocuments({
          case_diff_id: caseDiffId,
          card_type: "Clue",
        }),
      ]);

      expect(npcCount, `${caseDiffId} NPC count`).toBe(7);
      expect(clueCount, `${caseDiffId} clue count`).toBe(3);
    }
  });
});
