import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { saveCategoryHints } from "./store-category-hints";

const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? "anthropic.claude-3-haiku-20240307-v1:0";
const REGION   = process.env.AWS_REGION ?? "us-east-1";

let _client: BedrockRuntimeClient | null = null;
function getClient() {
  if (!_client) _client = new BedrockRuntimeClient({ region: REGION });
  return _client;
}

export interface ClassifiedItem {
  itemName: string;
  productGroup: string | null;
  subCategory: string | null;
  category: string;
}

/**
 * Analyses the classified items from a receipt and writes a compact
 * per-store "category cheat sheet" to StoreCategoryHints.
 *
 * The cheat sheet is injected into future classification prompts for the
 * same store so Claude can leverage store-specific naming patterns.
 */
export async function learnCategoryPatterns(
  storeChain: string,
  items: ClassifiedItem[],
): Promise<void> {
  if (!storeChain || items.length === 0) return;

  // Only include items that were actually classified
  const classified = items.filter(i => i.productGroup && i.subCategory);
  if (classified.length === 0) return;

  const itemList = classified
    .map(i => `  • "${i.itemName}" → ${i.productGroup} (${i.subCategory})`)
    .join("\n");

  const prompt = `You are a retail receipt intelligence agent. You have just processed a receipt from "${storeChain}" and successfully classified all items.

Your job: analyze the item names and their correct classifications to identify store-specific naming patterns. Write a concise "category cheat sheet" that will help an AI classify future items from this store correctly.

Successfully classified items from this receipt:
${itemList}

Write the cheat sheet covering:
1. Abbreviations or short codes this store uses (e.g. "BNG" = Banana, "ORG" = Organic, "WHL" = Whole)
2. Store brand prefixes and what product types they cover
3. Any naming conventions specific to this store (ALL CAPS, numeric suffixes, etc.)
4. 3-5 concrete example mappings as "name pattern → correct product group" that would help classify unseen items

Keep it under 250 words. Write only the cheat sheet, no preamble. Use clear, terse bullet points.`;

  try {
    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 400,
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
    const hints = (parsed.content?.[0]?.text ?? "").trim();

    if (hints) {
      await saveCategoryHints(storeChain, hints, classified.length);
      console.log(`[CategoryLearner] Saved hints for "${storeChain}" (${classified.length} items)`);
    }
  } catch (err) {
    console.warn("[CategoryLearner] Failed:", err instanceof Error ? err.message : err);
  }
}
