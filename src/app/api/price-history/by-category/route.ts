import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { CategoryGroup, CategoryItem, StorePrice } from "@/types/price-intel";

export type { CategoryGroup, CategoryItem, StorePrice };

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Get per-item per-store aggregates, pulling category from PriceHistory
  // (with ReceiptItem as fallback for older rows that predate the category column)
  const rows = await prisma.$queryRaw<Array<{
    itemNameNormalized: string;
    category: string;
    storeChain: string;
    avgPrice: number;
    minPrice: number;
    purchases: number;
  }>>`
    WITH ph AS (
      SELECT
        ph."itemNameNormalized",
        -- prefer PriceHistory.category; fall back to most recent ReceiptItem category
        COALESCE(
          NULLIF(ph.category, 'General'),
          (
            SELECT ri.category
            FROM "ReceiptItem" ri
            WHERE ri."userId" = ph."userId"
              AND ri."itemNameNormalized" = ph."itemNameNormalized"
            ORDER BY ri."createdAt" DESC
            LIMIT 1
          ),
          'General'
        ) AS category,
        ph."storeChain",
        ph."unitPrice"
      FROM "PriceHistory" ph
      WHERE ph."userId" = ${userId}
        AND ph."unitPrice" > 0
        AND ph."storeChain" != ''
    )
    SELECT
      "itemNameNormalized",
      category,
      "storeChain",
      CAST(AVG("unitPrice") AS float) AS "avgPrice",
      CAST(MIN("unitPrice") AS float) AS "minPrice",
      COUNT(*)::int AS purchases
    FROM ph
    GROUP BY "itemNameNormalized", category, "storeChain"
    ORDER BY category, "itemNameNormalized", "avgPrice" ASC
  `;

  // Group into category → item → stores
  const byCategory: Record<string, Record<string, CategoryItem>> = {};

  for (const row of rows) {
    const cat = row.category || "General";
    const key = row.itemNameNormalized;

    if (!byCategory[cat]) byCategory[cat] = {};
    if (!byCategory[cat][key]) {
      byCategory[cat][key] = {
        itemNameNormalized: key,
        category: cat,
        stores: [],
        bestPrice: 0,
        multiStore: false,
      };
    }

    byCategory[cat][key].stores.push({
      storeChain: row.storeChain,
      avgPrice: Number(row.avgPrice),
      minPrice: Number(row.minPrice),
      purchases: Number(row.purchases),
      isCheapest: false,
    });
  }

  const categoryOrder = [
    "Groceries", "Household", "Personal Care", "Medicine",
    "Electronics", "Dining", "Travel", "Entertainment", "General",
  ];

  const result: CategoryGroup[] = [];

  for (const cat of [...categoryOrder, ...Object.keys(byCategory).filter(c => !categoryOrder.includes(c))]) {
    if (!byCategory[cat]) continue;
    const items: CategoryGroup["items"] = Object.values(byCategory[cat]).flatMap((item) => {
      const sorted = [...item.stores].sort((a, b) => a.avgPrice - b.avgPrice);
      if (sorted.length === 0) return [];
      sorted[0]!.isCheapest = true;
      return [{
        itemNameNormalized: item.itemNameNormalized,
        category: item.category,
        stores: sorted,
        bestPrice: sorted[0]!.avgPrice,
        multiStore: sorted.length > 1,
      }];
    });
    // Sort: multi-store items first (savings opportunity), then by name
    items.sort((a, b) => {
      if (a.multiStore !== b.multiStore) return a.multiStore ? -1 : 1;
      return a.itemNameNormalized.localeCompare(b.itemNameNormalized);
    });
    result.push({ category: cat, items });
  }

  return NextResponse.json(result);
}
