// Seed data from worksheet: case_vocabularies
const CaseVocabulary = require("../models/CaseVocabulary");
const { objectIdFromCode, upsertMany, assertReference } = require("./seedUtils");

const seedData = require("./seedData/caseVocabularies");

async function seed() {
  const documents = seedData.map((row) => ({
    case_vocab_id: objectIdFromCode(row.case_vocab_id),
    case_id: objectIdFromCode(row.case_id),
    vocabulary_id: objectIdFromCode(row.vocabulary_id),
  }));

  const result = await upsertMany(CaseVocabulary, documents, "case_vocab_id");
  console.log("CaseVocabulary: " + result.upsertedCount + " inserted, " + result.modifiedCount + " updated.");
  return result;
}

module.exports = seed;
