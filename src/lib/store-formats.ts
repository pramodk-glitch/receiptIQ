/**
 * Store Format Registry
 *
 * Maintains per-store receipt format hints that are injected into the OCR
 * prompt. Pre-seeded formats handle known tricky stores immediately; the DB
 * layer persists formats discovered at runtime so accuracy improves over time.
 */

import { prisma } from "./db";

// ── Pre-seeded formats ────────────────────────────────────────────────────────
// Key: lowercase store name (partial match is fine — we check via includes).
// Value: the exact hint text injected into the OCR prompt.
export const SEEDED_FORMATS: Record<string, string> = {
  "target": `STORE FORMAT (Target digital receipt):
Each item section looks like:
  ITEM NAME
  Qty N • $X unit price
  Amount          $X.XX
  Discounts
    Target Circle Rewards    -$Y.YY   ← SKIP this line
    Save $Z promotion        -$Y.YY   ← SKIP this line
  Taxes & fees
    Sales tax                $T.TT    ← SKIP this line
  Item total                 $Z.ZZ   ← USE this as line_total

Rules:
- Use the unit price from "Qty N • $X unit price" as unit_price.
- Use "Item total" as line_total (the actual charged amount after discounts).
- SKIP all Discount lines (negative amounts) and Sales tax lines.
- Do NOT use "Amount" as the line_total — that is the pre-discount price.`,

  "patidar": `STORE FORMAT (Patidar Supermarket):
Each item is printed as TWO lines:
  Line 1: [item_number] ITEM NAME [: optional size/description]
  Line 2 (indented, right-aligned): QTY @ UNIT_PRICE   LINE_TOTAL [N/T]
The indented price line (Line 2) always belongs to the item on Line 1 IMMEDIATELY ABOVE it — never to the item below.
Example:
  4 LAXMI IDLY RICE : 20 LB
                  1 @ 23.99   23.99 N   ← belongs to Laxmi Idly Rice
  5 CHINESE BROOM
                  2 @ 4.99    9.98 T    ← belongs to Chinese Broom
  6 BLUEBERRIES : 1 pint
                  1 @ 3.99    3.99 N    ← belongs to Blueberries`,
};

// ── Normalise store name for lookup ──────────────────────────────────────────
function normalize(name: string) {
  return name.toLowerCase().trim();
}

// ── Lookup ────────────────────────────────────────────────────────────────────
export async function getFormatHints(storeName: string): Promise<string | null> {
  if (!storeName) return null;
  const key = normalize(storeName);

  // 1. Check pre-seeded map first (instant, no DB round-trip)
  for (const [seed, hints] of Object.entries(SEEDED_FORMATS)) {
    if (key.includes(seed)) return hints;
  }

  // 2. Check DB for formats learned at runtime
  try {
    const record = await prisma.storeFormat.findFirst({
      where: { storeName: { contains: key, mode: "insensitive" } },
    });
    return record?.formatHints ?? null;
  } catch {
    return null; // DB miss is non-fatal
  }
}

// ── Save / update ─────────────────────────────────────────────────────────────
export async function saveFormatHints(
  storeName: string,
  formatHints: string,
): Promise<void> {
  if (!storeName) return;
  const key = normalize(storeName);
  try {
    await prisma.storeFormat.upsert({
      where: { storeName: key },
      create: { storeName: key, formatHints, sampleCount: 1 },
      update: {
        formatHints,
        sampleCount: { increment: 1 },
        lastSeen: new Date(),
      },
    });
  } catch (e) {
    console.error("saveFormatHints error (non-fatal):", e);
  }
}

// ── Detect & build format hint from observed shift pattern ────────────────────
// Called after server-side shift correction fires so we can persist the hint.
export function buildTwoLineHint(storeName: string): string {
  return `STORE FORMAT (${storeName}):
Each item is printed as TWO lines:
  Line 1: [item_number] ITEM NAME [: optional description]
  Line 2 (indented): QTY @ UNIT_PRICE   LINE_TOTAL [N/T]
The price line (Line 2) belongs to the item IMMEDIATELY ABOVE it, not below.`;
}
