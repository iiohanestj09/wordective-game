// Seed data from worksheet: case_difficulties
// SOURCE MAPPING: workbook column "logic_note" -> model/Collections field "logic_notes".
// The source row is preserved; only the field name is mapped.
const CaseDifficulty = require("../models/CaseDifficulty");
const { objectIdFromCode, upsertMany, assertReference } = require("./seedUtils");

const seedData = require("./seedData/caseDifficulties");

async function seed() {
  const documents = seedData.map((row) => ({
    case_diff_id: objectIdFromCode(row.case_diff_id),
    case_id: objectIdFromCode(row.case_id),
    difficulty_id: objectIdFromCode(row.difficulty_id),
    correct_suspect: row.correct_suspect,
    logic_notes: row.logic_notes,
  }));

  const result = await upsertMany(CaseDifficulty, documents, "case_diff_id");
  console.log("CaseDifficulty: " + result.upsertedCount + " inserted, " + result.modifiedCount + " updated.");
  return result;
}

module.exports = seed;
