// Collection: vocabularies
const mongoose = require("mongoose");

const vocabularySchema = new mongoose.Schema(
  {
    vocabulary_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId(),
    },

    word: {
      type: String,
      required: true,
      trim: true,
    },

    meaning: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    collection: "vocabularies",
    timestamps: false,
  }
);

module.exports = mongoose.model("Vocabulary", vocabularySchema);