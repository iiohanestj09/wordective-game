// Collection: card_vocabularies
const mongoose = require("mongoose");

const cardVocabularySchema = new mongoose.Schema(
  {
    card_vocab_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId(),
    },

    card_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },

    vocabulary_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vocabulary",
      required: true,
    },
  },
  {
    collection: "card_vocabularies",
    timestamps: false,
  }
);

// Mencegah vocabulary yang sama terhubung ke card yang sama
cardVocabularySchema.index(
  {
    card_id: 1,
    vocabulary_id: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "CardVocabulary",
  cardVocabularySchema
);