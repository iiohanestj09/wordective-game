// Seed data from worksheet: cards
const Card = require("../models/Card");
const { objectIdFromCode, upsertMany, assertReference } = require("./seedUtils");

const seedData = require("./seedData/cards");

async function seed() {
  const documents = seedData.map((row) => ({
    card_id: objectIdFromCode(row.card_id),
    case_diff_id: objectIdFromCode(row.case_diff_id),
    card_type: row.card_type,
    card_title: row.card_title,
    content: row.content,
    main_idea: row.main_idea,
  }));

  const result = await upsertMany(Card, documents, "card_id");
  console.log("Card: " + result.upsertedCount + " inserted, " + result.modifiedCount + " updated.");
  return result;
}

module.exports = seed;
