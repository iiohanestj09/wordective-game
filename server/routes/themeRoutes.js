const express = require('express');
const Theme = require('../models/Theme');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const themes = await Theme.find().lean();
    res.json(themes);
  } catch (error) {
    console.error('Failed to fetch themes:', error);
    res.status(500).json({ message: 'Failed to fetch themes.' });
  }
});

module.exports = router;
