// Collection: difficulties
const mongoose = require("mongoose");

const difficultySchema = new mongoose.Schema(
  {
    difficulty_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId(),
    },

    difficulty_label: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    collection: "difficulties",
    timestamps: false,
  }
);

module.exports = mongoose.model("Difficulty", difficultySchema);