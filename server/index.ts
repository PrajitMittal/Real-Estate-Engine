import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3001;

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasOpenRouter: !!process.env.OPENROUTER_API_KEY,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
  });
});

// OpenRouter proxy (Claude/GPT for market research, recommendations, risks)
app.post('/api/chat', async (req, res) => {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return res.status(500).json({ error: 'OPENROUTER_API_KEY not set' });

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': 'https://zo.world',
        'X-Title': 'Zo Real Estate Engine',
      },
      body: JSON.stringify({
        model: req.body.model || 'anthropic/claude-sonnet-4',
        messages: req.body.messages,
        temperature: req.body.temperature ?? 0.7,
        max_tokens: req.body.max_tokens ?? 4000,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('OpenRouter error:', err);
    res.status(500).json({ error: 'OpenRouter API call failed' });
  }
});

// Image render proxy — fetches placeholder images and returns as base64
app.post('/api/render', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    // Generate a deterministic seed from prompt so same product+view always gets same image
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      hash = ((hash << 5) - hash) + prompt.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash) % 1000;

    // Use Lorem Picsum for placeholder images (reliable, fast, free)
    const imageUrl = `https://picsum.photos/seed/${seed}/1792/1024`;

    const imageRes = await fetch(imageUrl, { redirect: 'follow' });
    if (!imageRes.ok) throw new Error(`Image fetch returned ${imageRes.status}`);

    const arrayBuffer = await imageRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
    const dataUrl = `data:${contentType};base64,${base64}`;

    res.json({ data: [{ url: dataUrl }] });
  } catch (err) {
    console.error('Render error:', err);
    res.status(500).json({ error: 'Image generation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Zo Engine API server running on port ${PORT}`);
  console.log(`OpenRouter: ${process.env.OPENROUTER_API_KEY ? '✓' : '✗'}`);
  console.log(`OpenAI: ${process.env.OPENAI_API_KEY ? '✓' : '✗'}`);
});
