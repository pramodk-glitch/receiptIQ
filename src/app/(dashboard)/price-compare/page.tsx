import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PriceTrendChart } from "@/components/price-intel/PriceTrendChart";
import { PriceAlertCard } from "@/components/price-intel/PriceAlertCard";
import { PriceCategoryTree } from "@/components/price-intel/PriceCategoryTree";
import type { CategoryGroup } from "@/types/price-intel";

async function getTopItems(userId: string): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ itemNameNormalized: string }>>`
    SELECT "itemNameNormalized"
    FROM "PriceHistory"
    WHERE "userId" = ${userId} AND "unitPrice" > 0
    GROUP BY "itemNameNormalized"
    ORDER BY COUNT(*) DESC
    LIMIT 200
  `;
  return rows.map((r) => r.itemNameNormalized);
}

async function getAnomalies(userId: string) {
  const rows = await prisma.$queryRaw<
    Array<{
      itemNameNormalized: string;
      storeChain: string;
      latestPrice: number;
      historicalAvg: number;
      percentChange: number;
      capturedAt: string;
    }>
  >`
    WITH recent AS (
      SELECT DISTINCT ON ("itemNameNormalized")
        "itemNameNormalized",
        "storeChain",
        "unitPrice" AS "latestPrice",
        "capturedAt"
      FROM "PriceHistory"
      WHERE "userId" = ${userId} AND "unitPrice" > 0
      ORDER BY "itemNameNormalized", "capturedAt" DESC
    ),
    historical AS (
      SELECT
        "itemNameNormalized",
        AVG("unitPrice") AS "historicalAvg"
      FROM "PriceHistory"
      WHERE "userId" = ${userId}
        AND "capturedAt" < NOW() - INTERVAL '1 month'
        AND "unitPrice" > 0
      GROUP BY "itemNameNormalized"
      HAVING COUNT(*) >= 3
    )
    SELECT
      r."itemNameNormalized",
      r."storeChain",
      CAST(r."latestPrice" AS float) AS "latestPrice",
      CAST(h."historicalAvg" AS float) AS "historicalAvg",
      CAST(((r."latestPrice" - h."historicalAvg") / NULLIF(h."historicalAvg", 0)) * 100 AS float) AS "percentChange",
      to_char(r."capturedAt", 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "capturedAt"
    FROM recent r
    JOIN historical h USING ("itemNameNormalized")
    WHERE r."latestPrice" > h."historicalAvg" * 1.2
    ORDER BY "percentChange" DESC
    LIMIT 20
  `;

  return rows.map((r) => ({
    itemNameNormalized: r.itemNameNormalized,
    storeChain: r.storeChain,
    latestPrice: Number(r.latestPrice),
    historicalAvg: Number(r.historicalAvg),
    percentChange: Number(r.percentChange),
    capturedAt: r.capturedAt,
  }));
}

async function getCategoryTree(userId: string): Promise<CategoryGroup[]> {
  const rows = await prisma.$queryRaw<Array<{
    itemNameNormalized: string;
    category: string;
    storeChain: string;
    avgPrice: number;
    minPrice: number;
    purchases: number;
  }>>`
    WITH item_cats AS (
      SELECT DISTINCT ON ("itemNameNormalized")
        "itemNameNormalized",
        category
      FROM "ReceiptItem"
      WHERE "userId" = ${userId}
      ORDER BY "itemNameNormalized", "createdAt" DESC
    ),
    ph_agg AS (
      SELECT
        "itemNameNormalized",
        "storeChain",
        CAST(AVG("unitPrice") AS float) AS "avgPrice",
        CAST(MIN("unitPrice") AS float) AS "minPrice",
        COUNT(*)::int AS purchases
      FROM "PriceHistory"
      WHERE "userId" = ${userId}
        AND "unitPrice" > 0
        AND "storeChain" != ''
      GROUP BY "itemNameNormalized", "storeChain"
    )
    SELECT
      p."itemNameNormalized",
      COALESCE(ic.category, 'General') AS category,
      p."storeChain",
      p."avgPrice",
      p."minPrice",
      p.purchases
    FROM ph_agg p
    LEFT JOIN item_cats ic USING ("itemNameNormalized")
    ORDER BY category, p."itemNameNormalized", p."avgPrice" ASC
  `;

  const byCategory: Record<string, Record<string, {
    itemNameNormalized: string; category: string;
    stores: Array<{ storeChain: string; avgPrice: number; minPrice: number; purchases: number; isCheapest: boolean }>;
    bestPrice: number; multiStore: boolean;
  }>> = {};

  for (const row of rows) {
    const cat = row.category || "General";
    if (!byCategory[cat]) byCategory[cat] = {};
    if (!byCategory[cat][row.itemNameNormalized]) {
      byCategory[cat][row.itemNameNormalized] = {
        itemNameNormalized: row.itemNameNormalized, category: cat,
        stores: [], bestPrice: 0, multiStore: false,
      };
    }
    byCategory[cat][row.itemNameNormalized].stores.push({
      storeChain: row.storeChain,
      avgPrice: Number(row.avgPrice), minPrice: Number(row.minPrice),
      purchases: Number(row.purchases), isCheapest: false,
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
    items.sort((a, b) => {
      if (a.multiStore !== b.multiStore) return a.multiStore ? -1 : 1;
      return a.itemNameNormalized.localeCompare(b.itemNameNormalized);
    });
    result.push({ category: cat, items });
  }
  return result;
}

export default async function PriceComparePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [topItems, anomalies, categoryTree] = await Promise.all([
    getTopItems(userId),
    getAnomalies(userId),
    getCategoryTree(userId),
  ]);

  const totalItems = categoryTree.reduce((s, g) => s + g.items.length, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Price Intelligence</h1>
        <p className="text-slate-500 mt-1">
          Track price trends, find the cheapest stores, and spot unusual price spikes.
        </p>
      </div>

      {/* Price Alerts */}
      {anomalies.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-slate-800">Price Spike Alerts</h2>
            <span className="ml-auto text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              {anomalies.length} alert{anomalies.length !== 1 ? "s" : ""}
            </span>
          </div>
          <PriceAlertCard anomalies={anomalies} />
        </div>
      )}

      {/* Category Tree */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <h2 className="text-lg font-semibold text-slate-800">All Items by Category</h2>
          {totalItems > 0 && (
            <span className="ml-auto text-xs text-slate-400">{totalItems} items tracked</span>
          )}
        </div>
        <PriceCategoryTree data={categoryTree} />
      </div>

      {/* Price Trend Chart */}
      {topItems.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <h2 className="text-lg font-semibold text-slate-800">Weekly Price Trend</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Average price per week by store, last 12 months.</p>
          <PriceTrendChart topItems={topItems} />
        </div>
      )}
    </div>
  );
}
