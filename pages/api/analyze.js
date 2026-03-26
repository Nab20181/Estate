export const config = { api: { bodyParser: { sizeLimit: '20mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image, mediaType, apiKey } = req.body;
  const key = process.env.ANTHROPIC_API_KEY || apiKey;

  if (!image || !key) return res.status(400).json({ error: 'Image and API key required.' });

  const prompt = `You are an expert appraiser and resale specialist with deep knowledge of instruments, collectibles, electronics, and secondhand markets.

SAFETY CHECK — Before analyzing, check if the photo contains any of the following. If yes, return ONLY this JSON and nothing else:
{"blocked": true, "reason": "brief explanation"}

Blocked content (mirrors eBay/Facebook Marketplace policies):
- People, faces, or body parts (even partially visible as the main subject)
- Prescription medications or controlled substances
- Weapons, firearms, ammunition, or weapon components
- Live animals or pets
- Alcohol or tobacco products as the primary item
- Adult/explicit content
- Government IDs, passports, financial documents
- Recalled or hazardous items

If the photo shows a PERSON wearing or holding an item, analyze ONLY the item (e.g. the watch, the clothing) — not the person. Describe the item only, ignore the human subject.

Analyze this item from the photo VERY carefully. Pay close attention to:
- Exact string count on guitars/basses (count the tuning pegs — 6, 7, 8 string?)
- Handedness — is it left-handed or right-handed? (look at which side the nut cutaway is on, which direction strings run)
- Brand logos, model names, serial number plates visible in photo
- Condition details visible — scratches, wear, missing parts
- Any unique or distinguishing features that affect value

Return ONLY raw JSON — no markdown, no explanation.

{
  "name": "specific item name including ALL key specs — e.g. 'Ibanez RG7421 7-String Left-Handed Electric Guitar' not just 'Electric Guitar'",
  "category": "Electronics | Collectibles | Clothing | Furniture | Books | Jewelry | Toys | Musical Instruments | Art | Other",
  "description": "3-4 sentence description. MUST mention: handedness if instrument, exact string/key count if applicable, brand, model, visible condition, any notable features",
  "condition": "Mint | Excellent | Good | Fair | Poor",
  "rarity": "Common | Uncommon | Rare | Very Rare | Extremely Rare",
  "rarityNote": "specific note about rarity, limited editions, or authenticity markers visible in photo",
  "estimatedValue": {
    "low": 0,
    "high": 0,
    "best": 0
  },
  "recentSales": "2-3 sentences on recent SOLD (not asking) prices for this exact item including handedness/specs if relevant. Left-handed instruments typically sell for 10-20% more than right-handed. Be conservative — use actual sold comps not retail price.",
  "bestPlatform": "eBay | Poshmark | Etsy | Facebook Marketplace | OfferUp | Mercari | Reverb",
  "bestPlatformReason": "one sentence why this platform is best",
  "ebayTitle": "optimized listing title under 80 chars — MUST include handedness (Left-Handed/LH) and string count if instrument",
  "listingDescription": "full ready-to-post listing, 3-4 paragraphs. For instruments: MUST mention handedness, string count, scale length if visible, what's included (case, strap, etc), condition details"
}

PRICING RULES — this is critical:
- Base ALL prices on actual SOLD listings on eBay/Reverb/Poshmark, NOT retail or asking prices
- Used items sell for 20-60% less than retail — factor this in
- Be conservative: if unsure, price lower not higher
- A $500 retail item in Good condition typically sells used for $150-250
- Common items have more competition and sell lower, price accordingly

If you are uncertain about any spec (especially handedness or string count), say so explicitly in the description rather than guessing wrong.`;

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

    if (result.blocked) {
      return res.status(422).json({ error: `This item can't be listed: ${result.reason}` });
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
