const themes = require("./seedData/themes");
const cases = require("./seedData/cases");
const difficulties = require("./seedData/difficulties");
const caseDifficulties = require("./seedData/caseDifficulties");
const cards = require("./seedData/cards");
const vocabularies = require("./seedData/vocabularies");
const caseVocabularies = require("./seedData/caseVocabularies");
const cardVocabularies = require("./seedData/cardVocabularies");

function validateSeedData() {
  const themeIds = new Set(themes.map((r) => r.theme_id));
  const caseIds = new Set(cases.map((r) => r.case_id));
  const difficultyIds = new Set(difficulties.map((r) => r.difficulty_id));
  const caseDiffIds = new Set(caseDifficulties.map((r) => r.case_diff_id));
  const cardIds = new Set(cards.map((r) => r.card_id));
  const vocabularyIds = new Set(vocabularies.map((r) => r.vocabulary_id));

  for (const row of cases) {
    if (!themeIds.has(row.theme_id)) {
      throw new Error(`[SEED VALIDATION] cases.${row.case_id}: theme_id "${row.theme_id}" tidak ditemukan.`);
    }
  }

  for (const row of caseDifficulties) {
    if (!caseIds.has(row.case_id)) {
      throw new Error(`[SEED VALIDATION] case_difficulties.${row.case_diff_id}: case_id "${row.case_id}" tidak ditemukan.`);
    }

    if (!difficultyIds.has(row.difficulty_id)) {
      throw new Error(
        `[SEED VALIDATION] case_difficulties.${row.case_diff_id}: difficulty_id "${row.difficulty_id}" tidak ditemukan di sheet difficulties. ` +
        `Periksa baris C004/CD004 pada workbook. Seeder sengaja TIDAK menebak atau mengganti nilai ini.`
      );
    }
  }

  for (const row of cards) {
    if (!caseDiffIds.has(row.case_diff_id)) {
      throw new Error(`[SEED VALIDATION] cards.${row.card_id}: case_diff_id "${row.case_diff_id}" tidak ditemukan.`);
    }
  }

  for (const row of caseVocabularies) {
    if (!caseIds.has(row.case_id)) {
      throw new Error(`[SEED VALIDATION] case_vocabularies.${row.case_vocab_id}: case_id "${row.case_id}" tidak ditemukan.`);
    }
    if (!vocabularyIds.has(row.vocabulary_id)) {
      throw new Error(`[SEED VALIDATION] case_vocabularies.${row.case_vocab_id}: vocabulary_id "${row.vocabulary_id}" tidak ditemukan.`);
    }
  }

  for (const row of cardVocabularies) {
    if (!cardIds.has(row.card_id)) {
      throw new Error(`[SEED VALIDATION] card_vocabularies.${row.card_vocab_id}: card_id "${row.card_id}" tidak ditemukan.`);
    }
    if (!vocabularyIds.has(row.vocabulary_id)) {
      throw new Error(`[SEED VALIDATION] card_vocabularies.${row.card_vocab_id}: vocabulary_id "${row.vocabulary_id}" tidak ditemukan.`);
    }
  }

  const wordMap = new Map();
  for (const row of vocabularies) {
    const normalized = String(row.word).trim().toLowerCase();
    if (!wordMap.has(normalized)) wordMap.set(normalized, []);
    wordMap.get(normalized).push(row.vocabulary_id);
  }

  const duplicateWords = [...wordMap.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([word, ids]) => ({ word, ids }));

  if (duplicateWords.length) {
    console.warn("[SEED WARNING] Workbook memiliki vocabulary word duplikat:");
    for (const item of duplicateWords) {
      console.warn(`  - ${item.word}: ${item.ids.join(", ")}`);
    }
  }

  console.log("[SEED VALIDATION] Semua pengecekan referensi yang dijalankan telah selesai.");
  return true;
}

module.exports = validateSeedData;
