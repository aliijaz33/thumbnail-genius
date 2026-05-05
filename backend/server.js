require('dotenv').config();
const express = require('express');
const cors = require('cors');

const CLOUDFLARE_WORKER_URL = process.env.CLOUDFLARE_WORKER_URL || 'https://free-image.ali6511353.workers.dev/';
const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY || '';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/generate-image', async (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await fetch(CLOUDFLARE_WORKER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: model || '@cf/stabilityai/stable-diffusion-xl-base-1.0',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudflare Worker error:', response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const buffer = await response.arrayBuffer();

    res.set('Content-Type', 'image/jpeg');
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Backend error:', error.message);
    res.status(500).json({ error: 'Failed to generate image', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend proxy running on http://localhost:${PORT}`);
});
