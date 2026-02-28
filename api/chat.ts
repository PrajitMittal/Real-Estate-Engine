import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}
