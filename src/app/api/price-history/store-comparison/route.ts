import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Items purchased from 2+ stores in the last 12 months with their per-store avg price
  const rows = await prisma.$queryRaw<
    Array<{
      itemNameNormalized: string;
      storeChain: string;
      avgPrice: number;
      minPrice: number;
      purchases: number;
    }>
  >`
    WITH item_store AS (
      SELECT
        "itemNameNormalized",
        "storeChain",
        CAST(AVG("unitPrice") AS float) AS "avgPrice",
        CAST(MIN("unitPrice") AS float) AS "minPrice",
        COUNT(*)::int AS purchases
      FROM "PriceHistory"
      WHERE "userId" = ${userId}
        AND "capturedAt" >= NOW() - INTERVAL '12 months'
        AND "storeChain" != ''
        AND "unitPrice" > 0
      GROUP BY "itemNameNormalized", "storeChain"
    ),
    multi_store_items AS (
      SELECT "itemNameNormalized"
      FROM item_store
      GROUP BY "itemNameNormalized"
      HAVING COUNT(DISTINCT "storeChain") >= 2
    )
    SELECT s.*
    FROM item_store s
    JOIN multi_store_items m USING ("itemNameNormalized")
    ORDER BY "itemNameNormalized", "avgPrice" ASC
    LIMIT 300
  `;

  // Group by item, annotate cheapest store
  const byItem: Record<
    string,
    {
      itemNameNormalized: string;
      stores: Array<{ storeChain: string; avgPrice: number; minPrice: number; purchases: number; isCheapest: boolean }>;
      savings: number;
    }
  > = {};

  for (const row of rows) {
    if (!byItem[row.itemNameNormalized]) {
      byItem[row.itemNameNormalized] = {
        itemNameNormalized: row.itemNameNormalized,
        stores: [],
        savings: 0,
      };
    }
    byItem[row.itemNameNormalized].stores.push({
      storeChain: row.storeChain,
      avgPrice: Number(row.avgPrice),
      minPrice: Number(row.minPrice),
      purchases: Number(row.purchases),
      isCheapest: false,
    });
  }

  const result = Object.values(byItem).map((item) => {
    const sorted = [...item.stores].sort((a, b) => a.avgPrice - b.avgPrice);
    sorted[0].isCheapest = true;
    const cheapest = sorted[0].avgPrice;
    const mostExpensive = sorted[sorted.length - 1].avgPrice;
    return {
      ...item,
      stores: sorted,
      savings: Number((mostExpensive - cheapest).toFixed(2)),
    };
  });

  // Sort by savings desc (most savings opportunity first)
  result.sort((a, b) => b.savings - a.savings);

  return NextResponse.json(result.slice(0, 30));
}
