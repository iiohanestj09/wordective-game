// Collection: case_difficulties
const mongoose = require("mongoose");

const caseDifficultySchema = new mongoose.Schema(
  {
    case_diff_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId(),
    },

    case_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },

    difficulty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Difficulty",
      required: true,
    },
  },
  {
    collection: "case_difficulties",
    timestamps: false,
  }
);

// Mencegah kombinasi case + difficulty yang sama
caseDifficultySchema.index(
  {
    case_id: 1,
    difficulty_id: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "CaseDifficulty",
  caseDifficultySchema
);