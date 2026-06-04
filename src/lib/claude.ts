import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const USE_LEGACY = process.env.USE_LEGACY_ANTHROPIC_API === "1";

export interface OcrLineItem {
  item_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  category: string;
}

export interface OcrResult {
  store_name: string;
  store_chain: string;
  receipt_date: string;
  total_amount: number;
  currency: string;
  items: OcrLineItem[];
}

const VALID_CATEGORIES = [
  "Groceries",
  "Electronics",
  "Dining",
  "Medicine",
  "Household",
  "Personal Care",
  "Travel",
  "Entertainment",
  "General",
] as const;

function normalizeCategory(raw: string): string {
  if (!raw) return "General";
  const normalized = raw.trim();
  const found = VALID_CATEGORIES.find(
    (c) => c.toLowerCase() === normalized.toLowerCase()
  );
  return found ?? "General";
}

function normalizeDate(raw: unknown): string {
  const today = new Date().toISOString().split("T")[0];
  if (typeof raw !== "string" || !raw.trim()) return today;

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) return raw.trim();

  // DD/MM/YYYY or DD-MM-YYYY (common on Indian receipts)
  const dmy = raw.trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (dmy) {
    const yr = dmy[3].length === 2 ? "20" + dmy[3] : dmy[3];
    return `${yr}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }

  // MM/DD/YYYY or other formats — let Date parse it
  const d = new Date(raw.trim());
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];

  return today;
}

function validateOcrResult(data: unknown): OcrResult {
  if (typeof data !== "object" || data === null) {
    throw new Error("OCR result is not an object");
  }

  const obj = data as Record<string, unknown>;

  const result: OcrResult = {
    store_name: typeof obj.store_name === "string" ? obj.store_name : "Unknown Store",
    store_chain: typeof obj.store_chain === "string" ? obj.store_chain : "",
    receipt_date: normalizeDate(obj.receipt_date),
    total_amount: typeof obj.total_amount === "number" ? obj.total_amount : 0,
    currency: typeof obj.currency === "string" ? obj.currency : "USD",
    items: [],
  };

  if (Array.isArray(obj.items)) {
    type RawItem = { item_name: string; quantity: number; unit_price: number; line_total: number; category: string };

    const raw: RawItem[] = obj.items
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map((item) => ({
        item_name:  typeof item.item_name  === "string" ? item.item_name  : "Unknown Item",
        quantity:   typeof item.quantity   === "number" ? item.quantity   : 1,
        unit_price: typeof item.unit_price === "number" ? item.unit_price : 0,
        line_total: typeof item.line_total === "number" ? item.line_total : 0,
        category:   normalizeCategory(typeof item.category === "string" ? item.category : "General"),
      }));

    // Detect the "price line shifted by one" pattern:
    // If >half the items have qty×price ≠ line_total but shifting prices one
    // position earlier fixes them, apply the shift.
    const mathOk = (item: RawItem) =>
      item.unit_price > 0 && item.line_total > 0 &&
      Math.abs(item.quantity * item.unit_price - item.line_total) <= 0.02;

    const badCount  = raw.filter(i => !mathOk(i)).length;
    const threshold = Math.ceil(raw.length / 2);

    if (badCount >= threshold && raw.length >= 2) {
      // Build shifted candidate: item[i] keeps its name but gets item[i+1]'s price fields
      const shifted = raw.map((item, i) => {
        const priceSource = raw[i + 1] ?? raw[i];
        return { ...item, quantity: priceSource.quantity, unit_price: priceSource.unit_price, line_total: priceSource.line_total };
      });
      const shiftedBad = shifted.filter(i => !mathOk(i)).length;
      if (shiftedBad < badCount) {
        result.items = shifted;
        return result;
      }
    }

    // Per-item fallback: if individual qty×price is wrong, infer qty from total/price
    result.items = raw.map((item) => {
      let { quantity: q, unit_price: u, line_total: t } = item;
      if (u > 0 && t > 0 && Math.abs(q * u - t) > 0.02) {
        const inferred = Math.round(t / u);
        if (inferred > 0 && Math.abs(inferred * u - t) <= 0.02) q = inferred;
      }
      return { ...item, quantity: q };
    });
  }

  return result;
}

const RECEIPT_PROMPT = `Extract all purchased items from this receipt and return ONLY a valid JSON object — no markdown, no explanation, no extra text.

{"store_name":"string","store_chain":"string","receipt_date":"YYYY-MM-DD","total_amount":number,"currency":"USD","items":[{"item_name":"string","quantity":number,"unit_price":number,"line_total":number,"category":"string"}]}

STEP 1 — Read each item number (1, 2, 3 …) printed on the left. Each number marks the start of one purchased item.

STEP 2 — For each item number N, the price information (QTY @ UNIT_PRICE  LINE_TOTAL) is printed on the very next line, indented, BEFORE item number N+1 appears. That price line belongs to item N — NOT to item N+1.

STEP 3 — Verify every item: round(quantity × unit_price, 2) = line_total. If the math fails, you matched the wrong price line — go back and fix it.

item_name rules:
- Title case, clean English product name.
- Strip the leading item number (e.g. "5 CHINESE BROOM" → "Chinese Broom").
- Strip trailing store codes or meaningless suffixes.
- Keep size/variety info that is part of the name.

quantity: the number printed BEFORE "@" on the price line. Never the item number.
unit_price: the number printed AFTER "@" on the price line.
line_total: the rightmost dollar amount on the price line.

For weight-priced items (e.g. "1.43 @ 2.99/lb") quantity is the weight as a decimal.

SKIP: discount/savings lines, negative amounts, tax, subtotal, total, payment, loyalty points.

total_amount: grand total charged after tax.
N or T after a price = non-taxable / taxable — ignore.
category must be one of: Groceries, Electronics, Dining, Medicine, Household, Personal Care, Travel, Entertainment, General`;

function parseClaudeResponse(responseText: string): OcrResult {
  const cleanedText = responseText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanedText);
  } catch {
    throw new Error(`Failed to parse OCR response as JSON: ${cleanedText.substring(0, 200)}`);
  }

  return validateOcrResult(parsed);
}

export async function extractReceiptFromImage(
  imageBuffer: Buffer,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
): Promise<OcrResult> {
  const base64Image = imageBuffer.toString("base64");

  if (USE_LEGACY) {
    const prompt = `Extract all line items from this receipt image. The image is provided as a data URI below.\nDATA_URI: data:${mediaType};base64,${base64Image}\nReturn JSON exactly in this shape (no additional text):\n{\n  "store_name": string,\n  "store_chain": string,\n  "receipt_date": "YYYY-MM-DD",\n  "total_amount": number,\n  "currency": "USD",\n  "items": [\n    {\n      "item_name": string,\n      "quantity": number,\n      "unit_price": number,\n      "line_total": number,\n      "category": string\n    }\n  ]\n}\nFor category, use only one of: Groceries | Electronics | Dining | Medicine | Household | Personal Care | Travel | Entertainment | General\nReturn only valid JSON, no markdown, no explanation.`;

    const res = await fetch("https://api.anthropic.com/v1/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      },
      body: JSON.stringify({ model: "claude-1", prompt, max_tokens: 2000, temperature: 0 }),
    });

    const json = await res.json();
    const responseText = json.completion ?? json.choices?.[0]?.text ?? "";
    return parseClaudeResponse(responseText);
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: "text",
            text: RECEIPT_PROMPT,
          },
        ],
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";
  return parseClaudeResponse(responseText);
}

export async function extractReceiptFromPdf(pdfBuffer: Buffer): Promise<OcrResult> {
  // Use fetch directly — SDK v0.27 silently drops document blocks.
  const base64Pdf = pdfBuffer.toString("base64");
  const content = [
    { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64Pdf } },
    { type: "text", text: RECEIPT_PROMPT },
  ];
  const text = await callAnthropicApi("claude-sonnet-4-6", 8192, content);
  return parseClaudeResponse(text);
}

/** Shared fetch-based caller — avoids SDK document-block drop bug for PDFs */
async function callAnthropicApi(
  model: string,
  max_tokens: number,
  content: unknown[],
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model, max_tokens, messages: [{ role: "user", content }] }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const result = await response.json();
  return result.content?.[0]?.text ?? "";
}

export async function extractReceiptFromUrl(
  url: string,
  mediaType: string,
  formatHints?: string,
): Promise<OcrResult> {
  const prompt = formatHints
    ? `${formatHints}\n\n---\n\n${RECEIPT_PROMPT}`
    : RECEIPT_PROMPT;

  const isPdf = mediaType === "application/pdf";
  // Use fetch directly for ALL URL calls — the SDK silently drops document
  // blocks (both base64 and URL-sourced), causing empty responses for PDFs.
  const content = isPdf
    ? [{ type: "document", source: { type: "url", url } }, { type: "text", text: prompt }]
    : [{ type: "image",    source: { type: "url", url } }, { type: "text", text: prompt }];

  const text = await callAnthropicApi("claude-sonnet-4-6", 8192, content);
  return parseClaudeResponse(text);
}

/**
 * Lightweight pre-pass: extract just the store name from the receipt header.
 * Uses claude-haiku for speed and low cost (~10x cheaper than Sonnet).
 */
export async function identifyStore(url: string, mediaType: string): Promise<string> {
  try {
    const isPdf = mediaType === "application/pdf";
    const storePrompt = "Identify the store or business from this receipt image. Look for store name text, logos, or branding (e.g. Target's red bullseye, Walmart's spark, Costco's logo). Reply with ONLY the store name (e.g. 'Target', 'Walmart', 'Patidar Supermarket'). If unknown, reply 'Unknown'.";
    const content = isPdf
      ? [{ type: "document", source: { type: "url", url } }, { type: "text", text: storePrompt }]
      : [{ type: "image",    source: { type: "url", url } }, { type: "text", text: storePrompt }];

    const name = await callAnthropicApi("claude-haiku-4-5", 30, content);
    return name.trim() || "Unknown";
  } catch {
    return "Unknown"; // non-fatal — OCR proceeds without hints
  }
}

export function getMediaType(
  contentType: string
): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  const map: Record<string, "image/jpeg" | "image/png" | "image/gif" | "image/webp"> = {
    "image/jpeg": "image/jpeg",
    "image/jpg": "image/jpeg",
    "image/png": "image/png",
    "image/gif": "image/gif",
    "image/webp": "image/webp",
  };
  return map[contentType.toLowerCase()] ?? "image/jpeg";
}
