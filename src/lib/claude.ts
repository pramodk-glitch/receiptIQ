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

const RECEIPT_PROMPT = `Extract all data from this receipt and return ONLY a JSON object — no markdown, no explanation, no extra text. Read only what is actually printed; do not guess or invent store names or items.

{"store_name":"string","store_chain":"string","receipt_date":"YYYY-MM-DD","total_amount":number,"currency":"USD","items":[{"item_name":"string","quantity":number,"unit_price":number,"line_total":number,"category":"string"}]}

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
      "anthropic-beta": "pdfs-2024-09-25",
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
