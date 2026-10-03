// Seed data from worksheet: cases
const Case = require("../models/Case");
const { objectIdFromCode, upsertMany, assertReference } = require("./seedUtils");

const seedData = require("./seedData/cases");

async function seed() {
  const documents = seedData.map((row) => ({
    case_id: objectIdFromCode(row.case_id),
    theme_id: objectIdFromCode(row.theme_id),
    case_title: row.case_title,
    story: row.story,
  }));

  const result = await upsertMany(Case, documents, "case_id");
  console.log("Case: " + result.upsertedCount + " inserted, " + result.modifiedCount + " updated.");
  return result;
}

module.exports = seed;
