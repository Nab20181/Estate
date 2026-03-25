export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { items, apiKey } = req.body;
  const key = process.env.ANTHROPIC_API_KEY || apiKey;
  if (!items || !key) return res.status(400).json({ error: 'Missing items or API key.' });

  const prompt = `You are a resale pricing expert. Given these items being sold as a bundle: ${items}

Return ONLY raw JSON:
{
  "individualTotal": 0,
  "bundlePrice": 0,
  "discountPercent": 0,
  "rationale": "one sentence explaining the bundle price",
  "description": "ready-to-post bundle listing description, 2-3 paragraphs"
}

Bundle price should be 10-25% below individual total to incentivize buyers. Be specific.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message });
    let raw = data.content[0].text.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    return res.status(200).json(JSON.parse(raw));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
