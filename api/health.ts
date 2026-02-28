import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.json({
    status: 'ok',
    hasOpenRouter: !!process.env.OPENROUTER_API_KEY,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
  });
}
