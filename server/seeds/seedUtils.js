const crypto = require("crypto");
const mongoose = require("mongoose");

function objectIdFromCode(code) {
  const hex = crypto
    .createHash("sha256")
    .update(`wordective:${code}`)
    .digest("hex")
    .slice(0, 24);

  return new mongoose.Types.ObjectId(hex);
}

async function upsertMany(Model, documents, keyField) {
  if (!documents.length) {
    return {
      matchedCount: 0,
      modifiedCount: 0,
      upsertedCount: 0,
    };
  }

  const operations = documents.map((document) => ({
    updateOne: {
      filter: {
        [keyField]: document[keyField],
      },
      update: {
        $set: document,
        $setOnInsert: {
          _id: document[keyField],
        },
      },
      upsert: true,
    },
  }));

  return Model.bulkWrite(operations, { ordered: true });
}

function assertReference(value, validValues, fieldName, context) {
  if (!validValues.has(value)) {
    throw new Error(
      `[SEED VALIDATION] ${context}: ${fieldName} "${value}" tidak ditemukan pada data master.`
    );
  }
}

module.exports = {
  objectIdFromCode,
  upsertMany,
  assertReference,
};
