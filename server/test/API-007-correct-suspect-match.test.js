// API-007: Verify each correct suspect matches exactly one NPC card.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
const {
  connectApiTestDatabase,
  disconnectApiTestDatabase,
} = require("./apiTestHelpers");

describe("API-007 correct suspect card matching", () => {
  beforeAll(connectApiTestDatabase);
  afterAll(disconnectApiTestDatabase);

  it("matches exactly one NPC card for every case-difficulty answer", async () => {
    const caseDifficulties = await mongoose.connection.db
      .collection("case_difficulties")
      .find({}, { projection: { case_diff_id: 1, correct_suspect: 1 } })
      .toArray();
    expect(caseDifficulties).toHaveLength(36);

    for (const caseDifficulty of caseDifficulties) {
      const npcCards = await mongoose.connection.db
        .collection("cards")
        .find(
          { case_diff_id: caseDifficulty.case_diff_id, card_type: "NPC" },
          { projection: { card_title: 1 } },
        )
        .toArray();
      const matchingCards = npcCards.filter((card) => (
        card.card_title.split(",")[0].trim().toLocaleLowerCase()
        === caseDifficulty.correct_suspect.trim().toLocaleLowerCase()
      ));

      expect(
        matchingCards,
        `${caseDifficulty.case_diff_id} correct suspect: ${caseDifficulty.correct_suspect}`,
      ).toHaveLength(1);
    }
  });
});
