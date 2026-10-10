const express = require('express');
const mongoose = require('mongoose');
const CaseDifficulty = require('../models/CaseDifficulty');
const Case = require('../models/Case');
const Difficulty = require('../models/Difficulty');

const router = express.Router();

router.get('/', async (req, res) => {
  const { theme_id: themeId, difficulty: difficultyLabel } = req.query;

  if (
    typeof themeId !== 'string'
    || !/^[a-f\d]{24}$/i.test(themeId)
    || typeof difficultyLabel !== 'string'
    || !difficultyLabel.trim()
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
    })
      .select('case_title story')
      .lean();

    if (matchingCases.length === 0) {
      return res.status(404).json({
        message: 'No story was found for this theme and difficulty.',
      });
    }

    const selectedCase = matchingCases[
      Math.floor(Math.random() * matchingCases.length)
    ];
    return res.json(selectedCase);
  } catch (error) {
    console.error('Failed to fetch story case:', error);
    return res.status(500).json({ message: 'Failed to fetch story case.' });
  }
});

module.exports = router;
