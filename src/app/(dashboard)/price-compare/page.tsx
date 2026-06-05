import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PriceTrendChart } from "@/components/price-intel/PriceTrendChart";
import { PriceAlertCard } from "@/components/price-intel/PriceAlertCard";
import { PriceCategoryTree } from "@/components/price-intel/PriceCategoryTree";
import type { CategoryNode, ProductGroup, ProductVariant, PriceTrend } from "@/types/price-intel";

const CATEGORY_ICONS: Record<string, string> = {
  Groceries: "🛒", Electronics: "⚡", Dining: "🍽️", Medicine: "💊",
  Household: "🏠", "Personal Care": "🧴", Travel: "✈️", Entertainment: "🎬", General: "📦",
};

const CATEGORY_ORDER = [
  "Groceries", "Household", "Personal Care", "Medicine",
  "Electronics", "Dining", "Travel", "Entertainment", "General",
];

function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

function computeTrend(prices: Array<{ unitPrice: number; capturedAt: string }>): PriceTrend {
  if (prices.length === 0) return { direction: "new", pct: 0, currentPrice: 0, previousPrice: null, currentDate: "", previousDate: null };

  const sorted = [...prices].sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
  const current = sorted[0];
  const prev = sorted[1] ?? null;

  if (!prev) return { direction: "new", pct: 0, currentPrice: current.unitPrice, previousPrice: null, currentDate: current.capturedAt, previousDate: null };

  const pct = ((current.unitPrice - prev.unitPrice) / prev.unitPrice) * 100;
  const direction = Math.abs(pct) < 2 ? "stable" : pct > 0 ? "up" : "down";

  return { direction, pct: Math.round(pct * 10) / 10, currentPrice: current.unitPrice, previousPrice: prev.unitPrice, currentDate: current.capturedAt, previousDate: prev.capturedAt };
}

async function getCategoryNodes(userId: string): Promise<CategoryNode[]> {
  // Fetch all price history with item names
  const rows = await prisma.$queryRaw<Array<{
    id: string;
    itemNameNormalized: string;
    productGroup: string | null;
    category: string;
    storeChain: string;
    unitPrice: number;
    capturedAt: string;
  }>>`
    SELECT
      ph.id,
      ph."itemNameNormalized",
      ph."productGroup",
      ph.category,
      ph."storeChain",
      CAST(ph."unitPrice" AS float) AS "unitPrice",
      to_char(ph."capturedAt", 'YYYY-MM-DD') AS "capturedAt"
    FROM "PriceHistory" ph
    WHERE ph."userId" = ${userId}
      AND ph."unitPrice" > 0
      AND ph."storeChain" != ''
    ORDER BY ph."capturedAt" DESC
  `;

  if (rows.length === 0) return [];

  // Group by category → productGroup → variants
  type GroupKey = string; // category__productGroup
  const map = new Map<string, Map<GroupKey, Array<typeof rows[number]>>>();

  for (const row of rows) {
    const cat = row.category || "General";
    const pg = row.productGroup || toTitleCase(
      row.itemNameNormalized.replace(/[™®©]/g, "").split(/[\s\-:,]+/).slice(0, 2).join(" ")
    );

    if (!map.has(cat)) map.set(cat, new Map());
    const catMap = map.get(cat)!;
    if (!catMap.has(pg)) catMap.set(pg, []);
    catMap.get(pg)!.push(row);
  }

  const nodes: CategoryNode[] = [];

  const orderedCats = [
    ...CATEGORY_ORDER.filter((c) => map.has(c)),
    ...Array.from(map.keys()).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  for (const cat of orderedCats) {
    const pgMap = map.get(cat)!;
    const products: ProductGroup[] = [];

    for (const [pg, entries] of Array.from(pgMap.entries())) {
      // Build variants: latest purchase per (itemNameNormalized, storeChain)
      const variantMap = new Map<string, typeof entries[number]>();
      for (const e of entries) {
        const vk = `${e.itemNameNormalized}__${e.storeChain}`;
        if (!variantMap.has(vk)) variantMap.set(vk, e); // already sorted desc
      }

      const allPrices = entries.map((e) => ({ unitPrice: Number(e.unitPrice), capturedAt: e.capturedAt }));
      const trend = computeTrend(allPrices);

      const variantList: ProductVariant[] = Array.from(variantMap.values()).map((e) => ({
        itemNameNormalized: e.itemNameNormalized,
        itemName: toTitleCase(e.itemNameNormalized.replace(/[™®©]/g, "")),
        storeChain: e.storeChain,
        unitPrice: Number(e.unitPrice),
        capturedAt: e.capturedAt,
        isCheapest: false,
      }));

      // Mark cheapest
      const minPrice = Math.min(...variantList.map((v) => v.unitPrice));
      variantList.forEach((v) => { v.isCheapest = v.unitPrice === minPrice; });
      variantList.sort((a, b) => a.unitPrice - b.unitPrice);

      const stores = Array.from(new Set(variantList.map((v) => v.storeChain)));
      const bestVariant = variantList[0];

      products.push({
        productGroup: pg,
        category: cat,
        variantCount: variantList.length,
        storeCount: stores.length,
        minPrice,
        maxPrice: Math.max(...variantList.map((v) => v.unitPrice)),
        bestStore: bestVariant?.storeChain ?? "",
        trend,
        variants: variantList,
      });
    }

    // Sort: multi-store first, then alphabetically
    products.sort((a, b) => {
      if (a.storeCount !== b.storeCount) return b.storeCount - a.storeCount;
      return a.productGroup.localeCompare(b.productGroup);
    });

    nodes.push({
      category: cat,
      icon: CATEGORY_ICONS[cat] ?? "📦",
      productCount: products.length,
      products,
    });
  }

  return nodes;
}

async function getTopItems(userId: string): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ itemNameNormalized: string }>>`
    SELECT "itemNameNormalized" FROM "PriceHistory"
    WHERE "userId" = ${userId} AND "unitPrice" > 0
    GROUP BY "itemNameNormalized" ORDER BY COUNT(*) DESC LIMIT 200
  `;
  return rows.map((r) => r.itemNameNormalized);
}

async function getAnomalies(userId: string) {
  const rows = await prisma.$queryRaw<Array<{
    itemNameNormalized: string; storeChain: string;
    latestPrice: number; historicalAvg: number; percentChange: number; capturedAt: string;
  }>>`
    WITH recent AS (
      SELECT DISTINCT ON ("itemNameNormalized")
        "itemNameNormalized", "storeChain", "unitPrice" AS "latestPrice", "capturedAt"
      FROM "PriceHistory"
      WHERE "userId" = ${userId} AND "unitPrice" > 0
      ORDER BY "itemNameNormalized", "capturedAt" DESC
    ),
    historical AS (
      SELECT "itemNameNormalized", AVG("unitPrice") AS "historicalAvg"
      FROM "PriceHistory"
      WHERE "userId" = ${userId} AND "capturedAt" < NOW() - INTERVAL '1 month' AND "unitPrice" > 0
      GROUP BY "itemNameNormalized" HAVING COUNT(*) >= 3
    )
    SELECT r."itemNameNormalized", r."storeChain",
      CAST(r."latestPrice" AS float) AS "latestPrice",
      CAST(h."historicalAvg" AS float) AS "historicalAvg",
      CAST(((r."latestPrice" - h."historicalAvg") / NULLIF(h."historicalAvg", 0)) * 100 AS float) AS "percentChange",
      to_char(r."capturedAt", 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "capturedAt"
    FROM recent r JOIN historical h USING ("itemNameNormalized")
    WHERE r."latestPrice" > h."historicalAvg" * 1.2
    ORDER BY "percentChange" DESC LIMIT 20
  `;
  return rows.map((r) => ({ ...r, latestPrice: Number(r.latestPrice), historicalAvg: Number(r.historicalAvg), percentChange: Number(r.percentChange) }));
}

export default async function PriceComparePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [topItems, anomalies, categoryNodes] = await Promise.all([
    getTopItems(userId),
    getAnomalies(userId),
    getCategoryNodes(userId),
  ]);

  const totalProducts = categoryNodes.reduce((s, n) => s + n.productCount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Price Intelligence</h1>
        <p className="text-slate-500 mt-1">
          Track price trends, compare stores, and spot price changes over time.
        </p>
      </div>

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

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h2 className="text-lg font-semibold text-slate-800">Price Tracker</h2>
          {totalProducts > 0 && (
            <span className="ml-auto text-xs text-slate-400">{totalProducts} products tracked</span>
          )}
        </div>
        <PriceCategoryTree data={categoryNodes} />
      </div>

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
