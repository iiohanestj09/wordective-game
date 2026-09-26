// Collection: cases
const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    case_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId(),
    },

    case_title: {
      type: String,
      required: true,
      trim: true,
    },

    story: {
      type: String,
      required: true,
    },
  },
  {
    collection: "cases",
    timestamps: false,
  }
);

module.exports = mongoose.model("Case", caseSchema);