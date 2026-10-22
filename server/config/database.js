const DEFAULT_TEST_URI = "mongodb://127.0.0.1:27017/wordective_test";
const DEFAULT_DEVELOPMENT_URI = "mongodb://127.0.0.1:27017/wordective_db";

function getMongoUri(environment = process.env) {
  if (environment.NODE_ENV === "test") {
    const uri = environment.MONGODB_TEST_URI || DEFAULT_TEST_URI;
    let databaseName;

    try {
      databaseName = new URL(uri).pathname.slice(1).split("?")[0];
    } catch (error) {
      throw new Error(`Invalid MONGODB_TEST_URI: ${error.message}`);
    }

    if (databaseName !== "wordective_test") {
      throw new Error(
        `Tests may only connect to "wordective_test"; received "${databaseName || "(no database name)"}".`,
      );
    }

    return uri;
  }

  return environment.MONGODB_URI || DEFAULT_DEVELOPMENT_URI;
}

module.exports = { getMongoUri };
