export const config = { api: { bodyParser: { sizeLimit: '20mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image, mediaType, apiKey } = req.body;
  const key = process.env.ANTHROPIC_API_KEY || apiKey;

  if (!image || !key) return res.status(400).json({ error: 'Image and API key required.' });

  const prompt = `You are a world-class expert appraiser with deep knowledge of musical instruments, fishing equipment, collectibles, electronics, and secondhand markets.

SAFETY CHECK — If the photo primarily shows a person/face, prescription drugs, weapons, live animals, adult content, or government IDs, return ONLY: {"blocked": true, "reason": "brief explanation"}
If a person is WEARING or HOLDING an item, analyze the ITEM only — ignore the person.

─── CRITICAL IDENTIFICATION RULES ───

GUITARS & BASSES:
- Count tuning pegs on the headstock. 6 pegs = 6-string. 7 pegs = 7-string. 8 pegs = 8-string. DO NOT ASSUME.
- Handedness: When the guitar is in playing position, if the headstock points LEFT it is right-handed. If the headstock points RIGHT it is left-handed. Alternatively: if the thickest string is at the TOP of the neck = right-handed. If thickest string is at BOTTOM = left-handed. If you cannot determine handedness with confidence, write "handedness unclear from this angle" in the name.
- Read brand logos and model names on the headstock EXACTLY as shown. Do not substitute.

FISHING REELS & RODS:
- Read the brand name on the reel body EXACTLY as printed. Do not guess or substitute a similar brand.
- Identify reel type: baitcaster, spinning, spincast, or fly.
- If you see "Lew's", "Lew's Speed Spool", "Laser MG" or similar — use EXACTLY that.
- Never replace the visible brand with a different brand (e.g. do not say Quantum if you see Lew's).

ALL ITEMS:
- Read visible brand logos, model names, serial numbers EXACTLY as shown.
- If a brand is partially visible or truly unreadable, say "brand unclear from photo" — NEVER substitute a guess.
- Describe only what you can actually see. Do not invent specs.

Return ONLY raw JSON — no markdown, no explanation.

{
  "name": "precise item name with all key specs. Examples: 'Epiphone Les Paul Standard Left-Handed Electric Guitar', 'Lew's Laser MG Baitcasting Reel', '7-String Electric Guitar - Handedness Unclear'. NEVER omit handedness or string count for instruments.",
  "category": "Musical Instruments | Fishing & Outdoors | Electronics | Collectibles | Clothing | Furniture | Books | Jewelry | Toys | Art | Other",
  "description": "3-4 sentences. For guitars: state exact string count (counted from tuning pegs), handedness determination and how you determined it, brand, model, finish color, visible condition. For reels: state exact brand as printed, model, reel type, condition. Never invent specs.",
  "condition": "Mint | Excellent | Good | Fair | Poor",
  "rarity": "Common | Uncommon | Rare | Very Rare | Extremely Rare",
  "rarityNote": "authentication or rarity note based on what is visible in photo",
  "estimatedValue": { "low": 0, "high": 0, "best": 0 },
  "recentSales": "2-3 sentences on actual SOLD prices for this exact item and configuration. Note left-handed premium (10-20% higher) if applicable.",
  "bestPlatform": "eBay | Reverb | Poshmark | Etsy | Facebook Marketplace | OfferUp | Mercari",
  "bestPlatformReason": "one sentence",
  "ebayTitle": "eBay title under 80 chars. MUST include: Left-Handed/LH if applicable, string count, exact brand and model",
  "listingDescription": "full listing description, 3-4 paragraphs, all visible specs stated accurately"
}

PRICING: Base on actual SOLD listings only, not retail. Used items: 20-60% below retail. Be conservative.`;

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
