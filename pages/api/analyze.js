export const config = { api: { bodyParser: { sizeLimit: '20mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image, mediaType, apiKey } = req.body;
  const key = process.env.ANTHROPIC_API_KEY || apiKey;

  if (!image || !key) return res.status(400).json({ error: 'Image and API key required.' });

  const prompt = `You are an expert appraiser and resale specialist. Analyze this item from the photo and return ONLY raw JSON — no markdown, no explanation.

{
  "name": "specific item name",
  "category": "category (Electronics | Collectibles | Clothing | Furniture | Books | Jewelry | Toys | Art | Other)",
  "description": "2-3 sentence description including key details, brand, model, condition notes from photo",
  "condition": "Mint | Excellent | Good | Fair | Poor",
  "rarity": "Common | Uncommon | Rare | Very Rare | Extremely Rare",
  "rarityNote": "specific note about rarity or authenticity — e.g. 'First edition', 'Real Princess Diana Beanie Baby has a PVC pellet tag', 'Standard mass production item'",
  "estimatedValue": {
    "low": 0,
    "high": 0,
    "best": 0
  },
  "recentSales": "2-3 sentences summarizing recent sold prices on eBay/Poshmark/Etsy for this exact item",
  "bestPlatform": "eBay | Poshmark | Etsy | Facebook Marketplace | OfferUp | Mercari",
  "bestPlatformReason": "one sentence why this platform is best for this item",
  "ebayTitle": "optimized eBay listing title under 80 characters with key search terms",
  "listingDescription": "full ready-to-post listing description, 3-4 paragraphs, covering item details, condition, what's included, shipping notes"
}

Be specific and accurate. Base prices on real current market data from your training. If you cannot identify the item clearly, say so in the name field.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: [{
            type: 'image',
            source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: image },
          }, {
            type: 'text',
            text: prompt,
          }],
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: `Claude (${response.status}): ${err.error?.message || JSON.stringify(err)}` });
    }

    const data = await response.json();
    let raw = data.content[0].text.trim();
    raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: 'Failed to parse response. Try again.' });
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
