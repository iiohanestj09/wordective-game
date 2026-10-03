const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");

async function connectDatabase() {
  const uri =
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/wordective_db";

  await mongoose.connect(uri);

  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

async function closeDatabase() {
  await mongoose.connection.close();
  console.log("MongoDB connection closed.");
}

module.exports = {
  connectDatabase,
  closeDatabase,
};
