import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { classifyItem, clearClassificationCache, sanitizeProduceMisclassification } from "@/lib/product-classifier";
import { classifyByKeyword } from "@/lib/local-classifier";
import { getCategoryHints } from "@/lib/store-category-hints";
import { learnCategoryPatterns } from "@/lib/category-learner";

// Reclassify all PriceHistory rows for the current user using the latest
// classification logic (keyword rules + Claude + store hints).
// Returns a summary when done. Runs synchronously — expect 30-120s for
// large histories.
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // 1. Fetch all distinct (itemNameNormalized, category, storeChain) tuples
  const rows = await prisma.$queryRaw<Array<{
    itemNameNormalized: string;
    itemName: string;
    category: string;
    storeChain: string;
  }>>`
    SELECT DISTINCT ON ("itemNameNormalized", "storeChain")
      "itemNameNormalized",
      "itemNameNormalized" AS "itemName",
      category,
      "storeChain"
    FROM "PriceHistory"
    WHERE "userId" = ${userId}
      AND "itemNameNormalized" IS NOT NULL
      AND "itemNameNormalized" != ''
    ORDER BY "itemNameNormalized", "storeChain", "capturedAt" DESC
  `;

  if (rows.length === 0) {
    return NextResponse.json({ updated: 0, message: "No items to reclassify" });
  }

  // Clear the in-process classification cache so stale results from earlier
  // in this server session don't block re-classification.
  clearClassificationCache();

  console.log(`[Reclassify] Starting reclassification of ${rows.length} unique items for user ${userId}`);

  // 2. Pre-fetch store hints for all stores in one pass
  const seenChains: Record<string, true> = {};
  rows.forEach(r => { if (r.storeChain) seenChains[r.storeChain] = true; });
  const storeChains = Object.keys(seenChains);
  const hintsMap = new Map<string, string | null>();
  await Promise.all(storeChains.map(async (sc) => {
    hintsMap.set(sc, await getCategoryHints(sc));
  }));

  // 3. Reclassify each unique item, respecting rate limits with small batches
  const BATCH = 5;
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    await Promise.all(batch.map(async (row) => {
      try {
        // Title-case the normalised name for display matching
        const displayName = row.itemNameNormalized
          .split(/\s+/)
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        // Tier 2: keyword rules
        let productGroup: string | null = null;
        let subCategory: string | null = null;
        const kw = classifyByKeyword(displayName);
        if (kw) {
          productGroup = kw.productGroup;
          subCategory  = kw.subCategory;
        } else {
          // Tier 3: Claude with store hints
          const storeHints = hintsMap.get(row.storeChain) ?? null;
          const cls = await classifyItem(displayName, row.category, storeHints).catch(() => null);
          productGroup = cls?.productGroup ?? null;
          subCategory  = cls?.subCategory  ?? null;
        }

        // Apply safety net regardless of which tier classified it
        if (productGroup && subCategory) {
          const safe = sanitizeProduceMisclassification(displayName, { productGroup, subCategory });
          productGroup = safe.productGroup;
          subCategory  = safe.subCategory;
        }

        if (productGroup && subCategory) {
          await prisma.$executeRaw`
            UPDATE "PriceHistory"
            SET "productGroup" = ${productGroup},
                "subCategory"  = ${subCategory}
            WHERE "userId"              = ${userId}
              AND "itemNameNormalized"  = ${row.itemNameNormalized}
              AND "storeChain"          = ${row.storeChain}
          `;
          updated++;
        }
      } catch {
        failed++;
      }
    }));

    // Small pause between batches to avoid Claude rate limits
    if (i + BATCH < rows.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log(`[Reclassify] Done: ${updated} updated, ${failed} failed`);

  // 4. Fire category learner for each store so hints get refreshed
  //    (fire-and-forget — don't block the response)
  for (const sc of storeChains) {
    const storeItems = await prisma.$queryRaw<Array<{
      itemName: string; productGroup: string | null;
      subCategory: string | null; category: string;
    }>>`
      SELECT DISTINCT ON ("itemNameNormalized")
        "itemNameNormalized" AS "itemName",
        "productGroup", "subCategory", category
      FROM "PriceHistory"
      WHERE "userId" = ${userId}
        AND "storeChain" = ${sc}
        AND "productGroup" IS NOT NULL
      LIMIT 50
    `;
    learnCategoryPatterns(sc, storeItems).catch(() => {});
  }

  return NextResponse.json({
    total: rows.length,
    updated,
    failed,
    stores: storeChains.length,
    message: `Reclassified ${updated} of ${rows.length} items across ${storeChains.length} stores. Category hints are refreshing in the background.`,
  });
}
