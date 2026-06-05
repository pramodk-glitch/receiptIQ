/**
 * Classifies an item name into a short, generic product group using Claude Haiku.
 * e.g. "Vitamin D Whole Milk - 1gal - Good & Gather™" → "Milk"
 *      "Perdue Thin Sliced Antibiotic Free Chicken Breast 1.3lbs" → "Chicken Breast"
 *      "Pringles Snack Cups Variety Pack Potato Crisps 12.9oz" → "Potato Chips"
 */

const cache = new Map<string, string>();

export async function classifyProductGroup(
  itemName: string,
  category: string,
): Promise<string> {
  const key = `${category}:${itemName.toLowerCase().trim()}`;
  if (cache.has(key)) return cache.get(key)!;

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return fallback(itemName);

    const prompt = `What is the short generic product type for this grocery/retail item?
Item: "${itemName}"
Category: ${category}

Reply with ONLY the generic product name in title case, 1-3 words max.
Examples:
  "Vitamin D Whole Milk - 1gal - Good & Gather" → Milk
  "Perdue Thin Sliced Antibiotic Free Chicken Breast" → Chicken Breast
  "Pringles Snack Cups Variety Pack Potato Crisps 12.9oz" → Potato Chips
  "Fresh Broccoli Florets 12oz - Good & Gather" → Broccoli
  "Laxmi Idly Rice 20lb" → Rice
  "Chinese Broom" → Broom
  "King Machine Washable Extra Firm Bed Pillow" → Bed Pillow`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 20,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) return fallback(itemName);
    const json = await res.json();
    const group = (json.content?.[0]?.text ?? "").trim().replace(/['"]/g, "");
    const result = group || fallback(itemName);
    cache.set(key, result);
    return result;
  } catch {
    return fallback(itemName);
  }
}

/** Simple fallback: title-case first 2 meaningful words */
function fallback(itemName: string): string {
  const stopWords = new Set([
    "the", "a", "an", "of", "with", "from", "by", "at", "in", "for",
    "and", "&", "-", "fresh", "organic", "free", "brand", "may", "vary",
  ]);
  const words = itemName
    .replace(/[™®©]/g, "")
    .replace(/\d+(\.\d+)?\s*(oz|lb|lbs|g|kg|ml|l|pk|ct|pc|pcs|gal|pint|qt)\b/gi, "")
    .split(/[\s\-:,/]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !stopWords.has(w.toLowerCase()));

  return words
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ") || itemName.split(" ").slice(0, 2).join(" ");
}
