const express = require('express');
const mongoose = require('mongoose');
const CaseDifficulty = require('../models/CaseDifficulty');
const Case = require('../models/Case');
const Card = require('../models/Card');
const CardVocabulary = require('../models/CardVocabulary');
const Difficulty = require('../models/Difficulty');
const Vocabulary = require('../models/Vocabulary');

const router = express.Router();

router.get('/', async (req, res) => {
  const {
    theme_id: themeId,
    difficulty: difficultyLabel,
    case_id: caseId,
  } = req.query;

  if (
    typeof themeId !== 'string'
    || !/^[a-f\d]{24}$/i.test(themeId)
    || typeof difficultyLabel !== 'string'
    || !difficultyLabel.trim()
    || (
      caseId !== undefined
      && (typeof caseId !== 'string' || !/^[a-f\d]{24}$/i.test(caseId))
    )
  ) {
    return res.status(400).json({
      message: 'A valid theme_id and difficulty are required.',
    });
  }

  try {
    const difficulty = await Difficulty.findOne({
      difficulty_label: difficultyLabel.trim(),
    }).lean();

    if (!difficulty) {
      return res.status(404).json({ message: 'Difficulty not found.' });
    }

    const caseDifficulties = await CaseDifficulty.find({
      difficulty_id: new mongoose.Types.ObjectId(difficulty.difficulty_id),
    })
      .select('case_id')
      .lean();
    const caseIds = caseDifficulties.map((caseDifficulty) => caseDifficulty.case_id);
    const matchingCases = await Case.find({
      case_id: { $in: caseIds },
      theme_id: new mongoose.Types.ObjectId(themeId),
      ...(caseId ? { case_id: new mongoose.Types.ObjectId(caseId) } : {}),
    })
      .select('case_id case_title story')
      .lean();

    if (matchingCases.length === 0) {
      return res.status(404).json({
        message: 'No story was found for this theme and difficulty.',
      });
    }

    const selectedCase = matchingCases[
      Math.floor(Math.random() * matchingCases.length)
    ];
    const selectedCaseDifficulty = await CaseDifficulty.findOne({
      case_id: selectedCase.case_id,
      difficulty_id: new mongoose.Types.ObjectId(difficulty.difficulty_id),
    })
      .select('case_diff_id correct_suspect logic_notes')
      .lean();

    if (!selectedCaseDifficulty) {
      return res.status(404).json({
        message: 'Difficulty details were not found for the selected case.',
      });
    }

    const npcCards = await Card.find({
      case_diff_id: selectedCaseDifficulty.case_diff_id,
      card_type: 'NPC',
    })
      .select('card_id card_title content main_idea gender img_url')
      .lean();

    if (npcCards.length !== 7) {
      console.error(
        `Expected 7 NPC cards for case difficulty ${selectedCaseDifficulty.case_diff_id}, found ${npcCards.length}.`,
      );
      return res.status(500).json({
        message: 'The selected case does not have exactly 7 NPC cards.',
      });
    }

    const clueCards = await Card.find({
      case_diff_id: selectedCaseDifficulty.case_diff_id,
      card_type: 'Clue',
    })
      .select('card_id card_title content main_idea gender img_url')
      .lean();

    if (clueCards.length !== 3) {
      console.error(
        `Expected 3 clue cards for case difficulty ${selectedCaseDifficulty.case_diff_id}, found ${clueCards.length}.`,
      );
      return res.status(500).json({
        message: 'The selected case does not have exactly 3 clue cards.',
      });
    }

    const allCards = [...npcCards, ...clueCards];
    const cardVocabularyLinks = await CardVocabulary.find({
      card_id: { $in: allCards.map((card) => card.card_id) },
    })
      .select('card_id vocabulary_id')
      .lean();
    const vocabularyIds = cardVocabularyLinks.map((link) => link.vocabulary_id);
    const vocabularies = await Vocabulary.find({
      vocabulary_id: { $in: vocabularyIds },
    })
      .select('vocabulary_id word meaning')
      .lean();
    const vocabularyById = new Map(
      vocabularies.map((vocabulary) => [
        String(vocabulary.vocabulary_id),
        { word: vocabulary.word, meaning: vocabulary.meaning },
      ]),
    );
    const vocabulariesByCardId = new Map();

    for (const link of cardVocabularyLinks) {
      const vocabulary = vocabularyById.get(String(link.vocabulary_id));
      if (!vocabulary) {
        throw new Error(
          `Vocabulary ${link.vocabulary_id} linked to card ${link.card_id} was not found.`,
        );
      }

      const cardKey = String(link.card_id);
      const cardVocabularies = vocabulariesByCardId.get(cardKey) ?? [];
      cardVocabularies.push(vocabulary);
      vocabulariesByCardId.set(cardKey, cardVocabularies);
    }

    for (const card of allCards) {
      card.vocabularies = vocabulariesByCardId.get(String(card.card_id)) ?? [];
    }

    for (let index = npcCards.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [npcCards[index], npcCards[randomIndex]] = [
        npcCards[randomIndex],
        npcCards[index],
      ];
    }

    return res.json({
      ...selectedCase,
      correct_suspect: selectedCaseDifficulty.correct_suspect,
      logic_notes: selectedCaseDifficulty.logic_notes,
      cards: npcCards,
      clues: clueCards,
    });
  } catch (error) {
    console.error('Failed to fetch story case:', error);
    return res.status(500).json({ message: 'Failed to fetch story case.' });
  }
});

module.exports = router;
