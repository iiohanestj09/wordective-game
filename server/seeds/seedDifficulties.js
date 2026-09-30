// Seed data from worksheet: difficulties
const Difficulty = require("../models/Difficulty");
const { objectIdFromCode, upsertMany, assertReference } = require("./seedUtils");

const seedData = require("./seedData/difficulties");

async function seed() {
  const documents = seedData.map((row) => ({
    difficulty_id: objectIdFromCode(row.difficulty_id),
    difficulty_label: row.difficulty_label,
  }));

  const result = await upsertMany(Difficulty, documents, "difficulty_id");
  console.log("Difficulty: " + result.upsertedCount + " inserted, " + result.modifiedCount + " updated.");
  return result;
}

module.exports = seed;
