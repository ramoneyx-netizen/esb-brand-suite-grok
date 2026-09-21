import type { VercelRequest, VercelResponse } from '@vercel/node';

type Provider = 'gemini' | 'grok';
const json = (res: VercelResponse, status: number, body: unknown) => res.status(status).json(body);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return json(res, 405, { error: 'POST required' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  const provider: Provider = body.provider === 'gemini' ? 'gemini' : 'grok'; // Grok is default

  if (prompt.length < 3 || prompt.length > 4000) {
    return json(res, 400, { error: 'Prompt must be between 3 and 4000 characters.' });
  }

  const system = `You are an expert brand strategist powered by Grok. 
Return a concise, actionable brand brief with these sections:
1. Positioning
2. Target Audience
3. Brand Personality
4. Tagline Options (3)
5. Visual Direction
Keep it sharp, modern, and practical.`;

  try {
    let response: Response;

    if (provider === 'grok') {
      if (!process.env.XAI_API_KEY) {
        return json(res, 503, { error: 'Grok is not configured. Add XAI_API_KEY in Vercel.' });
      }
      response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.XAI_MODEL || 'grok-3-mini',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt },
          ],
        }),
      });
    } else {
      if (!process.env.GEMINI_API_KEY) {
        return json(res, 503, { error: 'Gemini is not configured on the server.' });
      }
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-2.0-flash'}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          }),
        }
      );
    }

    const data = await response.json() as any;
    if (!response.ok) {
      return json(res, response.status, { error: data?.error?.message || 'Provider request failed.' });
    }

    const text =
      provider === 'grok'
        ? data?.choices?.[0]?.message?.content
        : data?.candidates?.[0]?.content?.parts?.map((part: any) => part.text).join('');

    return text
      ? json(res, 200, { provider, text })
      : json(res, 502, { error: 'Provider returned no text.' });
  } catch (error) {
    console.error('AI request failed', error);
    return json(res, 502, { error: 'Unable to reach the AI provider.' });
  }
}
