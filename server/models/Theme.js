// Collection: themes
const mongoose = require("mongoose");

const themeSchema = new mongoose.Schema(
  {
    theme_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId(),
    },

    theme_name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    collection: "themes",
    timestamps: false,
  }
);

module.exports = mongoose.model("Theme", themeSchema);