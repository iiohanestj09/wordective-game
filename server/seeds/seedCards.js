// Seed data from worksheet: cards
const Card = require("../models/Card");
const { objectIdFromCode, upsertMany } = require("./seedUtils");
const { connectDatabase, closeDatabase } = require("./seedConnection");

const seedData = require("./seedData/cards");

async function seed() {
  const documents = seedData.map((row) => ({
    card_id: objectIdFromCode(row.card_id),
    case_diff_id: objectIdFromCode(row.case_diff_id),
    card_type: row.card_type,
    card_title: row.card_title,
    content: row.content,
    main_idea: row.main_idea,
    gender: row.gender ?? null,
    img_url: row.img_url ?? null,
  }));

  const result = await upsertMany(Card, documents, "card_id");

  console.log(
    `Card: ${result.upsertedCount} inserted, ${result.modifiedCount} updated.`
  );

  return result;
}

if (require.main === module) {
  (async () => {
    try {
      await connectDatabase();
      await seed();
    } catch (error) {
      console.error("Seed cards gagal:", error);
      process.exitCode = 1;
    } finally {
      try {
        await closeDatabase();
      } catch (error) {
        console.error("Gagal menutup koneksi MongoDB:", error);
        process.exitCode = 1;
      }
    }
  })();
}

module.exports = seed;