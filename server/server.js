require('dotenv').config();
const mongoose = require('mongoose');
const createApp = require("./app");
const { getMongoUri } = require("./config/database");
const app = createApp();

mongoose.connect(getMongoUri())
  .then(() => {
    console.log(`Terhubung ke MongoDB ${mongoose.connection.name}`);
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Gagal terhubung ke MongoDB:', err.message);
  });