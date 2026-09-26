// Collection: cards
const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    card_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId(),
    },

    case_diff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CaseDifficulty",
      required: true,
    },

    card_type: {
      type: String,
      required: true,
      enum: ["NPC", "Clue"],
    },

    card_title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    main_idea: {
      type: String,
      required: true,
    },
  },
  {
    collection: "cards",
    timestamps: false,
  }
);

module.exports = mongoose.model("Card", cardSchema);