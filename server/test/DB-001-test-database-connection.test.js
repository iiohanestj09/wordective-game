// DB-001: Verify tests connect to the restored wordective_test database.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
const mongoose = require("mongoose");
const {
  connectTestDatabase,
  disconnectTestDatabase,
} = require("./testDatabase");

describe("DB-001 test database connection", () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it("connects to wordective_test and reads the restored collection counts", async () => {
    expect(mongoose.connection.name).toBe("wordective_test");

    const expectedCounts = {
      themes: 6,
      cases: 36,
      difficulties: 3,
      case_difficulties: 36,
      cards: 360,
      vocabularies: 300,
      case_vocabularies: 225,
      card_vocabularies: 641,
    };

    for (const [collectionName, expectedCount] of Object.entries(expectedCounts)) {
      const actualCount = await mongoose.connection.db
        .collection(collectionName)
        .countDocuments();
      expect(actualCount, collectionName).toBe(expectedCount);
    }
  });
});
