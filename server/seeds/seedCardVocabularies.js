// Seed data from worksheet: card_vocabularies
const CardVocabulary = require("../models/CardVocabulary");
const { objectIdFromCode, upsertMany, assertReference } = require("./seedUtils");

const seedData = require("./seedData/cardVocabularies");

async function seed() {
  const documents = seedData.map((row) => ({
    card_vocab_id: objectIdFromCode(row.card_vocab_id),
    card_id: objectIdFromCode(row.card_id),
    vocabulary_id: objectIdFromCode(row.vocabulary_id),
  }));

  const result = await upsertMany(CardVocabulary, documents, "card_vocab_id");
  console.log("CardVocabulary: " + result.upsertedCount + " inserted, " + result.modifiedCount + " updated.");
  return result;
}

module.exports = seed;
