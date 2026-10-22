const mongoose = require("mongoose");
const { getMongoUri } = require("../config/database");

async function connectTestDatabase() {
  const uri = getMongoUri({ ...process.env, NODE_ENV: "test" });
  await mongoose.connect(uri);

  const databaseName = mongoose.connection.name;
  if (databaseName !== "wordective_test") {
    await mongoose.disconnect();
    throw new Error(
      `Refusing to run tests against database "${databaseName}".`,
    );
  }

  return mongoose.connection;
}

async function disconnectTestDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  connectTestDatabase,
  disconnectTestDatabase,
};
