const mongoose = require("mongoose");
const Case = require("../models/Case");
const CaseDifficulty = require("../models/CaseDifficulty");
const Difficulty = require("../models/Difficulty");
const Theme = require("../models/Theme");
const {
  connectTestDatabase,
  disconnectTestDatabase,
} = require("./testDatabase");

async function connectApiTestDatabase() {
  await connectTestDatabase();
}

async function disconnectApiTestDatabase() {
  await disconnectTestDatabase();
}

async function getValidCaseQuery(difficultyLabel = "Beginner") {
  const [theme, difficulty] = await Promise.all([
    Theme.findOne().lean(),
    Difficulty.findOne({ difficulty_label: difficultyLabel }).lean(),
  ]);

  if (!theme || !difficulty) {
    throw new Error(`Test database is missing a theme or "${difficultyLabel}" difficulty.`);
  }

  const caseDifficulties = await CaseDifficulty.find({
    difficulty_id: new mongoose.Types.ObjectId(difficulty.difficulty_id),
  }).lean();

  if (caseDifficulties.length === 0) {
    throw new Error(`Test database has no case for "${difficultyLabel}" difficulty.`);
  }

  const caseDocument = await Case.findOne({
    case_id: { $in: caseDifficulties.map((row) => row.case_id) },
    theme_id: theme.theme_id,
  }).lean();

  if (!caseDocument) {
    throw new Error("Test database has no case for the selected theme and difficulty.");
  }

  const caseDifficulty = caseDifficulties.find(
    (row) => String(row.case_id) === String(caseDocument.case_id),
  );

  if (!caseDifficulty) {
    throw new Error("Test case has no matching case-difficulty record.");
  }

  return {
    theme_id: String(theme.theme_id),
    difficulty: difficulty.difficulty_label,
    case_id: String(caseDocument.case_id),
    case_diff_id: String(caseDifficulty.case_diff_id),
    correct_suspect: caseDifficulty.correct_suspect,
  };
}

module.exports = {
  connectApiTestDatabase,
  disconnectApiTestDatabase,
  getValidCaseQuery,
};
