// Collection: case_vocabularies
const mongoose = require("mongoose");

const caseVocabularySchema = new mongoose.Schema(
  {
    case_vocab_id: {
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

    vocabulary_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vocabulary",
      required: true,
    },
  },
  {
    collection: "case_vocabularies",
    timestamps: false,
  }
);

// Mencegah vocabulary yang sama terhubung ke case yang sama
caseVocabularySchema.index(
  {
    case_id: 1,
    vocabulary_id: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "CaseVocabulary",
  caseVocabularySchema
);