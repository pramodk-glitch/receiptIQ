import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import type { OcrResult } from "./claude";

const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? "anthropic.claude-3-haiku-20240307-v1:0";
const REGION   = process.env.AWS_REGION ?? "us-east-1";

let _client: BedrockRuntimeClient | null = null;

function getClient(): BedrockRuntimeClient {
  if (!_client) {
    _client = new BedrockRuntimeClient({ region: REGION });
  }
  return _client;
}

/**
 * Analyses extracted receipt items for a store and returns a concise
 * store-format hint string suitable for `StoreFormat.formatHints`.
 * rawText is optional — items alone are enough for layout inference.
 * Returns null on any error so callers can safely ignore failures.
 */
export async function learnReceiptPattern(
  storeName: string,
  rawText: string,
  items: OcrResult["items"],
): Promise<string | null> {
  if (!storeName || storeName === "Unknown" || items.length === 0) return null;

  const itemSummary = items
    .slice(0, 15)
    .map(i => `  • "${i.item_name}" qty=${i.quantity} unit_price=${i.unit_price} total=${i.line_total}`)
    .join("\n");

  const rawSection = rawText?.trim()
    ? `\nReceipt raw text (first 1000 chars):\n${rawText.slice(0, 1000)}\n`
    : "";

  const prompt = `You are an OCR prompt engineer. Analyze the extracted line items from a "${storeName}" receipt and write a concise 2-3 sentence format hint describing this store's receipt layout. The hint will be prepended to future OCR prompts to improve extraction accuracy.

Infer from the item names and values:
- Naming style (abbreviations, ALL-CAPS, mixed case, brand prefixes)
- Whether unit/weight items appear (qty < 1 suggests weighted produce)
- Whether unit prices are always present or sometimes missing
- Any patterns suggesting discount lines or fees mixed in
${rawSection}
Extracted items:
${itemSummary}

Return ONLY the format hint text, 2-3 sentences, no preamble.`;

  try {
    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const cmd = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body,
    });

    const resp = await getClient().send(cmd);
    const decoded = new TextDecoder().decode(resp.body);
    const parsed = JSON.parse(decoded);
    const text = (parsed.content?.[0]?.text ?? "").trim();
    return text || null;
  } catch (err) {
    console.warn("[Bedrock] Pattern learning failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
