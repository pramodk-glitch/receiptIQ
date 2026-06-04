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

function validateOcrResult(data: unknown): OcrResult {
  if (typeof data !== "object" || data === null) {
    throw new Error("OCR result is not an object");
  }

  const obj = data as Record<string, unknown>;

  const result: OcrResult = {
    store_name: typeof obj.store_name === "string" ? obj.store_name : "Unknown Store",
    store_chain: typeof obj.store_chain === "string" ? obj.store_chain : "",
    receipt_date:
      typeof obj.receipt_date === "string"
        ? obj.receipt_date
        : new Date().toISOString().split("T")[0],
    total_amount: typeof obj.total_amount === "number" ? obj.total_amount : 0,
    currency: typeof obj.currency === "string" ? obj.currency : "USD",
    items: [],
  };

  if (Array.isArray(obj.items)) {
    result.items = obj.items
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map((item) => ({
        item_name: typeof item.item_name === "string" ? item.item_name : "Unknown Item",
        quantity: typeof item.quantity === "number" ? item.quantity : 1,
        unit_price: typeof item.unit_price === "number" ? item.unit_price : 0,
        line_total: typeof item.line_total === "number" ? item.line_total : 0,
        category: normalizeCategory(typeof item.category === "string" ? item.category : "General"),
      }));
  }

  return result;
}

const RECEIPT_PROMPT = `Extract all purchased items from this receipt and return ONLY a valid JSON object — no markdown, no explanation, no extra text.

{"store_name":"string","store_chain":"string","receipt_date":"YYYY-MM-DD","total_amount":number,"currency":"USD","items":[{"item_name":"string","quantity":number,"unit_price":number,"line_total":number,"category":"string"}]}

Follow these rules exactly:

item_name:
- Product name only — title case, clean English.
- Many receipts print a line number before the name (e.g. "5 CHINESE BROOM" or "12 BANANA BUNCH"). Do NOT include that number in the name.
- Strip any trailing store codes, department tags, or short numeric/dash suffixes that are not meaningful product words (e.g. "BROOM -2" → "Chinese Broom", "RICE 047" → "Rice").
- Size or variety information that is part of the product name is fine to keep (e.g. "Pringles Ranch 140g").

quantity:
- Number of units purchased (positive number).
- For weight-priced items the quantity is the weight (e.g. 1.43 lbs). Use the decimal weight as-is.
- Default 1 if not shown.

unit_price:
- Price for one unit or one lb/kg (positive number).
- Many receipts use the format "QTY @ UNIT_PRICE  LINE_TOTAL". Take the number after "@" as unit_price.
- Never negative.

line_total:
- The actual charged amount for that item (positive number).
- On receipts using "QTY @ UNIT_PRICE  LINE_TOTAL", take the rightmost number as line_total.

SKIP these lines — do not create items for them:
- "You Saved", "Regular Price", "Savings", discount, or coupon lines
- Any line whose dollar amount is negative
- Tax, fee, subtotal, total, balance, change, cash, or card payment lines
- Loyalty points, rewards, or receipt footer text

total_amount: The grand total actually charged (after tax).

N or T printed after a price means non-taxable / taxable — ignore it.

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
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const base64Pdf = pdfBuffer.toString("base64");

  // Use fetch directly — SDK v0.27 silently drops document blocks,
  // causing Claude to receive no content and hallucinate a receipt.
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64Pdf },
          },
          { type: "text", text: RECEIPT_PROMPT },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const text = result.content?.[0]?.text ?? "";
  return parseClaudeResponse(text);
}

export async function extractReceiptFromUrl(url: string, mediaType: string): Promise<OcrResult> {
  // SDK v0.27 doesn't support URL source types — use raw fetch to bypass the type constraints.
  // The API key is read the same way the SDK reads it at construction time.
  const apiKey = process.env.ANTHROPIC_API_KEY ?? (anthropic as unknown as { apiKey: string }).apiKey;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const isPdf = mediaType === "application/pdf";
  const contentBlock = isPdf
    ? { type: "document", source: { type: "url", url } }
    : { type: "image", source: { type: "url", url } };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: [contentBlock, { type: "text", text: RECEIPT_PROMPT }] }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const text = result.content?.[0]?.text ?? "";
  return parseClaudeResponse(text);
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
