require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const themeRoutes = require('./routes/themeRoutes');
const caseRoutes = require('./routes/caseRoutes');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/themes', themeRoutes);
app.use('/api/cases', caseRoutes);

// Tes route
app.get('/', (req, res) => {
  res.send('Wordective API is running...');
});

// Koneksi ke MongoDB Lokal
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Terhubung ke MongoDB Lokal');
    
    // Jalankan server hanya jika database terhubung
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Gagal terhubung ke MongoDB:', err.message);
  });

// Tambahkan baris ini untuk membuat folder 'public' bisa diakses secara publik
app.use(express.static(path.join(__dirname, 'public')));