// Seed data from worksheet: vocabularies
// Vocabulary IDs from the spreadsheet are preserved as deterministic ObjectId identities.
// Duplicate words in the workbook are NOT silently removed.
const Vocabulary = require("../models/Vocabulary");
const { objectIdFromCode, upsertMany, assertReference } = require("./seedUtils");

const seedData = require("./seedData/vocabularies");

async function seed() {
  const documents = seedData.map((row) => ({
    vocabulary_id: objectIdFromCode(row.vocabulary_id),
    word: row.word,
    meaning: row.meaning,
  }));

  const result = await upsertMany(Vocabulary, documents, "vocabulary_id");
  console.log("Vocabulary: " + result.upsertedCount + " inserted, " + result.modifiedCount + " updated.");
  return result;
}

module.exports = seed;
