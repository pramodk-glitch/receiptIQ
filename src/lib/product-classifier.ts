/**
 * Classifies a retail item into:
 *   - productGroup  — clean generic name, NO store brand tags
 *   - subCategory   — picked from the fixed taxonomy below
 *
 * One Claude Haiku call returns both fields as JSON.
 */

// ── Fixed taxonomy ────────────────────────────────────────────────────────────
export const SUBCATEGORY_TAXONOMY: Record<string, string[]> = {
  Groceries: [
    "Produce — Fruits",
    "Produce — Vegetables",
    "Dairy & Eggs",
    "Meat & Poultry",
    "Seafood",
    "Bakery & Bread",
    "Cereals & Grains",
    "Snacks & Chips",
    "Beverages",
    "Frozen Foods",
    "Canned & Packaged",
    "Condiments & Spices",
    "International Foods",
    "Other Groceries",
  ],
  Household: [
    "Cleaning",
    "Paper Products",
    "Laundry",
    "Kitchen & Dining",
    "Storage & Organization",
    "Other Household",
  ],
  "Personal Care": [
    "Hair Care",
    "Skin Care",
    "Oral Care",
    "Medicine & Health",
    "Other Personal Care",
  ],
  Electronics: ["Phones & Accessories", "Computers & Tablets", "TV & Audio", "Other Electronics"],
  Dining:        ["Restaurant", "Café & Coffee", "Fast Food", "Other Dining"],
  Travel:        ["Transport", "Accommodation", "Other Travel"],
  Entertainment: ["Streaming", "Events", "Books & Media", "Other Entertainment"],
  Medicine:      ["Prescription", "OTC Medication", "Vitamins & Supplements", "Other Medicine"],
  General:       ["General"],
};

// Store-owned brands whose names should be stripped from product group names
const STORE_BRANDS = [
  "good & gather", "market pantry", "threshold", "up & up", "simply balanced",
  "open nature", "signature select", "o organics", "lucerne", "kirkland",
  "great value", "equate", "sam's choice", "mainstays", "aldi", "trader joe",
  "365 by whole foods", "365 everyday", "whole foods 365",
  "ptdr", "patidar brand",
];

export interface ClassificationResult {
  productGroup: string;
  subCategory: string;
}

// Per-process cache — avoids duplicate API calls for same item within one run
const cache = new Map<string, ClassificationResult>();

export async function classifyItem(
  itemName: string,
  category: string,
): Promise<ClassificationResult> {
  const key = `${category}:${itemName.toLowerCase().trim()}`;
  if (cache.has(key)) return cache.get(key)!;

  const subCats = SUBCATEGORY_TAXONOMY[category] ?? SUBCATEGORY_TAXONOMY.General;
  const fallback = buildFallback(itemName, category);

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return fallback;

    const prompt = `Classify this retail item and return ONLY a JSON object, no other text.

Item: "${itemName}"
Top-level category: ${category}

Rules:
1. productGroup — the short generic product name (1-4 words, title case).
   - Strip ALL store brand names: ${STORE_BRANDS.slice(0, 8).join(", ")}, etc.
   - Strip sizes, weights, counts, and package descriptors.
   - Examples: "Vitamin D Whole Milk - 1gal - Good & Gather™" → "Milk"
               "Fresh Broccoli Florets 12oz - Good & Gather" → "Broccoli"
               "Pringles Snack Cups Variety Pack 12.9oz/18ct" → "Potato Chips"
               "Perdue Thin Sliced Antibiotic Free Chicken Breast 1.3lbs" → "Chicken Breast"
               "Frozen Crispy Hash Brown Potato Patties - Market Pantry™" → "Hash Browns"
               "Laxmi Idly Rice 20lb" → "Rice"
               "Chinese Broom" → "Broom"

2. subCategory — pick EXACTLY one from this list:
${subCats.map(s => `   - ${s}`).join("\n")}

Return: {"productGroup":"string","subCategory":"string"}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 60,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) return fallback;

    const json = await res.json();
    const text = (json.content?.[0]?.text ?? "").trim();
    const parsed = JSON.parse(text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim());

    const result: ClassificationResult = {
      productGroup: String(parsed.productGroup ?? fallback.productGroup).trim(),
      subCategory:  subCats.includes(parsed.subCategory)
                      ? parsed.subCategory
                      : fallback.subCategory,
    };

    cache.set(key, result);
    return result;
  } catch {
    return fallback;
  }
}

function buildFallback(itemName: string, category: string): ClassificationResult {
  const subCats = SUBCATEGORY_TAXONOMY[category] ?? ["General"];

  // Strip known store brands from display name
  let cleaned = itemName.replace(/[™®©]/g, "");
  for (const brand of STORE_BRANDS) {
    cleaned = cleaned.replace(new RegExp(brand, "gi"), "").trim();
  }

  // Strip sizes / weights / counts
  cleaned = cleaned
    .replace(/\d+(\.\d+)?\s*(oz|lb|lbs|g|kg|ml|l|pk|ct|pc|pcs|gal|pint|qt)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Title-case first 3 meaningful words
  const stopWords = new Set(["the","a","an","of","with","from","by","at","in","for","and","&","-","fresh","organic","free","brand","may","vary"]);
  const words = cleaned.split(/[\s\-:,/]+/)
    .map(w => w.trim())
    .filter(w => w.length > 1 && !stopWords.has(w.toLowerCase()));

  const productGroup = words.slice(0, 3)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ") || itemName.split(" ").slice(0, 2).join(" ");

  return { productGroup, subCategory: subCats[0] };
}

// ── Backfill helper (used in startup.js) ─────────────────────────────────────
// Kept for backward-compat — wraps classifyItem
export async function classifyProductGroup(itemName: string, category: string): Promise<string> {
  const result = await classifyItem(itemName, category);
  return result.productGroup;
}
