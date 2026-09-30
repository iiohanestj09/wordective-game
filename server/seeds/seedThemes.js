// Seed data from worksheet: themes
// SOURCE MAPPING: workbook column "story" -> model/Collections field "description".
// No theme text is changed; only the field name is mapped.
const Theme = require("../models/Theme");
const { objectIdFromCode, upsertMany, assertReference } = require("./seedUtils");

const seedData = require("./seedData/themes");

async function seed() {
  const documents = seedData.map((row) => ({
    theme_id: objectIdFromCode(row.theme_id),
    theme_name: row.theme_name,
    description: row.description,
  }));

  const result = await upsertMany(Theme, documents, "theme_id");
  console.log("Theme: " + result.upsertedCount + " inserted, " + result.modifiedCount + " updated.");
  return result;
}

module.exports = seed;
