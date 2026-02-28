import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    // Generate a deterministic seed from prompt
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      hash = ((hash << 5) - hash) + prompt.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash) % 1000;

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
}
