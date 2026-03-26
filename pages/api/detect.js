export const config = { api: { bodyParser: { sizeLimit: '20mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image, mediaType, apiKey } = req.body;
  const key = process.env.ANTHROPIC_API_KEY || apiKey;
  if (!image || !key) return res.status(400).json({ error: 'Image and API key required.' });

  const prompt = `You are a professional estate sale appraiser. Look at this photo carefully and identify EVERY distinct sellable item you can see.

For each item, provide an individual appraisal. Return ONLY a raw JSON array — no markdown, no explanation.

Rules:
- List every distinct item visible, even if partially obscured
- If an item is clearly part of a set (e.g. a set of dishes), count it as one item
- Do not list the same item twice
- Ignore fixed furniture, walls, floors unless they are clearly for sale
- If the photo shows only one item, return an array with one element
- Maximum 20 items per photo

Each item in the array must have exactly these fields:
{
  "name": "precise name — read brand/model labels exactly as visible, use 'Unidentified [type]' if brand unreadable",
  "category": "Musical Instruments | Fishing & Outdoors | Electronics | Collectibles | Clothing | Furniture | Books | Jewelry | Toys | Art | Other",
  "description": "2-3 honest sentences about what is visible. Note condition issues, brand/model if readable, key identifying features.",
  "condition": "Mint | Excellent | Good | Fair | Poor",
  "condition_notes": "Specific visible damage or wear, or 'No visible damage from this angle.'",
  "rarity": "Common | Uncommon | Rare | Very Rare | Extremely Rare",
  "rarity_notes": "Specific reason or 'Standard mass-produced item.'",
  "estimatedValue": { "low": 0, "high": 0, "best": 0 },
  "recentSales": "Actual eBay sold price range for this item. Conservative — used prices not retail.",
  "bestPlatform": "eBay | Reverb | Poshmark | Etsy | Facebook Marketplace | OfferUp | Mercari | Local Estate Sale",
  "bestPlatformReason": "One sentence.",
  "ebayTitle": "Optimized eBay title under 80 chars based only on confirmed visible details.",
  "listingDescription": "Ready-to-post listing, 2-3 paragraphs, honest and accurate."
}

PRICING: Base on actual eBay SOLD listings. Used = 20-60% below retail. Conservative.
ACCURACY: Only describe what you can actually see. Never fabricate brand names or model numbers.`;

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
        max_tokens: 4000,
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

    let items;
    try {
      items = JSON.parse(raw);
      if (!Array.isArray(items)) items = [items];
    } catch {
      return res.status(500).json({ error: 'Failed to parse response. Try again.' });
    }

    return res.status(200).json({ items, count: items.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
