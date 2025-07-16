const express = require('express');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();
const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

const upload = multer({ dest: 'uploads/' });

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Gemini API server is running at http://localhost:${PORT}`);
});

app.post('/generate-text', async (req, res) => {
  console.log('REQ BODY:', req.body); // cek isi body

  const { prompt } = req.body;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ output: response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/rekomendasi-film', async (req, res) => {
  const {
    genre,
    mood,
    terakhir_nonton,
    durasi,
    tahun,
    bahasa,
    gaya
  } = req.body;

  const prompt = `
Kamu adalah asisten AI pecinta film.
Berikan 3 rekomendasi film dengan kriteria:
- Genre: ${genre}
- Mood: ${mood}
- Film terakhir ditonton: ${terakhir_nonton}
- Durasi: ${durasi}
- Tahun rilis: ${tahun}
- Bahasa: ${bahasa}

Tulis dalam gaya ${gaya}. Sertakan judul, tahun, dan deskripsi pendek yang membuat penasaran, cocok untuk rekomendasi ke teman.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text().trim();

    // Pisahkan jadi array jika perlu
    const rekomendasi = raw.split('\n').filter(r => r.trim());

    res.json({ rekomendasi });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


