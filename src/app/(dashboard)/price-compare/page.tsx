import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PriceTrendChart } from "@/components/price-intel/PriceTrendChart";
import { StoreComparisonTable } from "@/components/price-intel/StoreComparisonTable";
import { PriceAlertCard } from "@/components/price-intel/PriceAlertCard";

async function getTopItems(userId: string): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ itemNameNormalized: string }>>`
    SELECT "itemNameNormalized"
    FROM "PriceHistory"
    WHERE "userId" = ${userId} AND "unitPrice" > 0
    GROUP BY "itemNameNormalized"
    ORDER BY COUNT(*) DESC
    LIMIT 50
  `;
  return rows.map((r) => r.itemNameNormalized);
}

async function getStoreComparison(userId: string) {
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

  const byItem: Record<
    string,
    {
      itemNameNormalized: string;
      stores: Array<{
        storeChain: string;
        avgPrice: number;
        minPrice: number;
        purchases: number;
        isCheapest: boolean;
      }>;
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

  result.sort((a, b) => b.savings - a.savings);
  return result.slice(0, 30);
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

export default async function PriceComparePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [topItems, storeComparison, anomalies] = await Promise.all([
    getTopItems(userId),
    getStoreComparison(userId),
    getAnomalies(userId),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Price Intelligence</h1>
        <p className="text-slate-500 mt-1">
          Track price trends, find the cheapest stores, and spot unusual price spikes — powered by TimescaleDB.
        </p>
      </div>

      {/* Price Alerts */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-slate-800">Price Spike Alerts</h2>
          {anomalies.length > 0 && (
            <span className="ml-auto text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              {anomalies.length} alert{anomalies.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <PriceAlertCard anomalies={anomalies} />
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

      {/* Store Comparison */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-slate-800">Cheapest Store by Item</h2>
          <span className="ml-auto text-xs text-slate-400">Items purchased from 2+ stores</span>
        </div>
        <StoreComparisonTable data={storeComparison} />
      </div>
    </div>
  );
}
