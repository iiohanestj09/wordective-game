const { connectDatabase, closeDatabase } = require("./seedConnection");
const validateSeedData = require("./validateSeedData");

const seedThemes = require("./seedThemes");
const seedDifficulties = require("./seedDifficulties");
const seedCases = require("./seedCases");
const seedCaseDifficulties = require("./seedCaseDifficulties");
const seedCards = require("./seedCards");
const seedVocabularies = require("./seedVocabularies");
const seedCaseVocabularies = require("./seedCaseVocabularies");
const seedCardVocabularies = require("./seedCardVocabularies");

async function seedAll() {
  try {
    validateSeedData();

    await connectDatabase();

    // Dependency order:
    // themes -> cases -> case_difficulties -> cards
    // difficulties -> case_difficulties
    // vocabularies -> case_vocabularies and card_vocabularies
    // cards -> card_vocabularies
    await seedThemes();
    await seedCases();
    await seedDifficulties();
    await seedCaseDifficulties();
    await seedCards();
    await seedVocabularies();
    await seedCaseVocabularies();
    await seedCardVocabularies();

    console.log("Wordective seeding completed successfully.");
  } catch (error) {
    console.error("Wordective seeding failed.");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    try {
      await closeDatabase();
    } catch (_) {
      // Connection may not have been established.
    }
  }
}

seedAll();
