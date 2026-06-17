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
  General: [
    "Electronics & Gadgets",
    "Clothing & Accessories",
    "Kids & Baby",
    "Home & Garden",
    "Arts & Crafts",
    "Sports & Outdoors",
    "Pet Supplies",
    "Books & Media",
    "Party & Gifts",
    "Other General",
  ],
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
  storeHints?: string | null,
): Promise<ClassificationResult> {
  const key = `${category}:${itemName.toLowerCase().trim()}`;
  if (cache.has(key)) return cache.get(key)!;

  // ── Tier 2: Keyword rules (free, instant, no API) ────────────────────────
  const { classifyByKeyword } = await import("./local-classifier");
  const kwResult = classifyByKeyword(itemName);
  if (kwResult) {
    cache.set(key, kwResult);
    return kwResult;
  }

  const subCats = SUBCATEGORY_TAXONOMY[category] ?? SUBCATEGORY_TAXONOMY.General;
  const fallback = buildFallback(itemName, category);

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return fallback;

    const storeContext = storeHints
      ? `\nStore-specific naming patterns (use these to improve accuracy):\n${storeHints}\n`
      : "";

    const prompt = `Classify this retail item and return ONLY a JSON object, no other text.
${storeContext}
Item: "${itemName}"
Top-level category: ${category}

Rules:
1. productGroup — the PRODUCT TYPE, not an ingredient or flavour (1-4 words, title case).
   CRITICAL: If an ingredient word (fruit, vegetable, spice) appears in the name of a
   packaged/processed product, use the PRODUCT TYPE, not the ingredient.
   - Strip ALL store brand names: ${STORE_BRANDS.slice(0, 8).join(", ")}, etc.
   - Strip sizes, weights, counts, and package descriptors.

   Examples — CORRECT:
     "Vitamin D Whole Milk 1gal Good & Gather™"       → "Milk"
     "Post Great Grains Banana Nut Crunch Cereal 18oz" → "Breakfast Cereal"
     "Tropicana Orange Juice 52oz"                     → "Orange Juice"
     "Welch's Grape Jam 18oz"                          → "Jam"
     "Lemon Pepper Seasoning 6oz"                      → "Seasoning"
     "Banana Republic Lip Balm"                        → "Lip Balm"
     "Fresh Broccoli Florets 12oz"                     → "Broccoli"
     "Pringles Snack Cups Variety Pack 18ct"           → "Potato Chips"
     "Perdue Thin Sliced Chicken Breast 1.3lbs"        → "Chicken Breast"
     "Frozen Hash Brown Potato Patties Market Pantry™" → "Hash Browns"
     "Laxmi Idly Rice 20lb"                            → "Rice"
     "Chinese Broom"                                   → "Broom"
     "Kirkland Signature Baby Wipes 900ct"             → "Baby Wipes"
     "Colgate Total Whitening Toothpaste 4oz"          → "Toothpaste"
     "Apple Watch Series 9"                            → "Smartwatch"

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
        max_tokens: 80,
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

  return { productGroup, subCategory: subCats[subCats.length - 1] };
}

// ── Backfill helper (used in startup.js) ─────────────────────────────────────
// Kept for backward-compat — wraps classifyItem
export async function classifyProductGroup(itemName: string, category: string): Promise<string> {
  const result = await classifyItem(itemName, category);
  return result.productGroup;
}
