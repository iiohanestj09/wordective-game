const express = require("express");
const cors = require("cors");
const path = require("path");
const themeRoutes = require("./routes/themeRoutes");
const caseRoutes = require("./routes/caseRoutes");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api/themes", themeRoutes);
  app.use("/api/cases", caseRoutes);

  app.get("/", (req, res) => {
    res.send("Wordective API is running...");
  });

  app.use(express.static(path.join(__dirname, "public")));

  return app;
}

module.exports = createApp;
