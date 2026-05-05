require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Replicate = require('replicate');

const CLOUDFLARE_WORKER_URL = process.env.CLOUDFLARE_WORKER_URL || '';
const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY || '';
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY || '';
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const replicate = REPLICATE_API_KEY ? new Replicate({ auth: REPLICATE_API_KEY }) : null;

app.post('/api/generate-image', async (req, res) => {
  const { prompt, model, source = 'cloudflare' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    let imageBuffer;

    if (source === 'replicate') {
      if (!replicate) {
        return res.status(500).json({ error: 'Replicate API key not configured' });
      }
      console.log(`Generating with Replicate: ${model}`);
      const output = await replicate.run(model, { input: { prompt } });
      const imageUrl = Array.isArray(output) ? output[0] : output;
      const imgResponse = await fetch(imageUrl);
      imageBuffer = Buffer.from(await imgResponse.arrayBuffer());
    } else if (source === 'together') {
      if (!TOGETHER_API_KEY) {
        return res.status(500).json({ error: 'Together AI API key not configured' });
      }
      console.log(`Generating with Together AI: ${model}`);
      const response = await fetch('https://api.together.xyz/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          width: 1024,
          height: 768,
          steps: 20,
          n: 1,
          response_format: 'b64_json',
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: `Together AI error: ${errText}` });
      }

      const data = await response.json();
      const base64Image = data.data[0].b64_json;
      imageBuffer = Buffer.from(base64Image, 'base64');
    } else if (source === 'openai') {
      if (!OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }
      console.log(`Generating with OpenAI DALL-E: ${model}`);
      const openaiModel = model === 'dall-e-2' ? 'dall-e-2' : 'dall-e-3';
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: openaiModel,
          prompt,
          n: 1,
          size: '1024x1024',
          quality: openaiModel === 'dall-e-3' ? 'hd' : undefined,
          response_format: 'url',
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: `OpenAI error: ${errText}` });
      }

      const data = await response.json();
      const imageUrl = data.data[0].url;
      const imgResponse = await fetch(imageUrl);
      imageBuffer = Buffer.from(await imgResponse.arrayBuffer());
    } else {
      console.log(`Generating with Cloudflare: ${model}`);
      const response = await fetch(CLOUDFLARE_WORKER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, model }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudflare Worker error:', response.status, errorText);
        return res.status(response.status).json({ error: errorText });
      }

      const buffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(buffer);
    }

    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);
  } catch (error) {
    console.error('Backend error:', error.message);
    res.status(500).json({ error: 'Failed to generate image', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend proxy running on http://localhost:${PORT}`);
  console.log(`Replicate: ${replicate ? 'configured' : 'not configured'}`);
  console.log(`Together AI: ${TOGETHER_API_KEY ? 'configured' : 'not configured'}`);
  console.log(`OpenAI DALL-E: ${OPENAI_API_KEY ? 'configured' : 'not configured'}`);
  console.log(`Cloudflare: ${CLOUDFLARE_WORKER_URL ? 'configured' : 'not configured'}`);
});
