import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { SUBCATEGORY_TAXONOMY } from "@/lib/product-classifier";

const CATEGORY_ICONS: Record<string, string> = {
  Groceries: "🛒", Electronics: "⚡", Dining: "🍽️", Medicine: "💊",
  Household: "🏠", "Personal Care": "🧴", Travel: "✈️", Entertainment: "🎬", General: "📦",
};

const PRODUCT_GROUP_ALIASES: Record<string, string> = {
  "whole milk": "Milk", "2% milk": "Milk", "1% milk": "Milk", "skim milk": "Milk",
  "fat free milk": "Milk", "oat milk": "Milk", "almond milk": "Milk", "soy milk": "Milk",
  "lactose free milk": "Milk", "bananas": "Banana",
};

function normalizeGroup(pg: string) {
  return PRODUCT_GROUP_ALIASES[pg.toLowerCase().trim()] ?? pg;
}

function inferUnit(name: string): string | null {
  const m = name.match(/\b(\d+(?:\.\d+)?)\s*(lb|lbs|oz|fl oz|kg|g|ml|gal|ct|pk|pack|count|gallon)\b/i);
  if (!m) return null;
  const unit = m[2].toLowerCase().replace("lbs","lb").replace("pack","pk").replace("count","ct").replace("gallon","gal");
  return m[1] + unit;
}

function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

export async function GET(req: NextRequest) {
  const user = getMobileUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await prisma.$queryRaw<Array<{
    itemNameNormalized: string; productGroup: string | null;
    subCategory: string | null; category: string;
    storeChain: string; unitPrice: number; unit: string | null; capturedAt: string;
  }>>`
    SELECT ph."itemNameNormalized", ph."productGroup", ph."subCategory",
      ph.category, ph."storeChain",
      CAST(ph."unitPrice" AS float) AS "unitPrice",
      ph.unit, to_char(ph."capturedAt", 'YYYY-MM-DD') AS "capturedAt"
    FROM "PriceHistory" ph
    WHERE ph."userId" = ${user.id}
      AND ph."unitPrice" > 0 AND ph."storeChain" != ''
    ORDER BY ph."capturedAt" DESC
  `;

  if (!rows.length) return NextResponse.json([]);

  // Build cat → sc → pg → entries
  const map = new Map<string, Map<string, Map<string, typeof rows>>>();
  for (const row of rows) {
    const cat = row.category || "General";
    const rawPg = row.productGroup || toTitleCase(row.itemNameNormalized.split(/[\s\-]+/).slice(0, 2).join(" "));
    const pg = normalizeGroup(rawPg);
    const taxList = SUBCATEGORY_TAXONOMY[cat] ?? SUBCATEGORY_TAXONOMY.General;
    const sc = row.subCategory || taxList[taxList.length - 1];
    if (!map.has(cat)) map.set(cat, new Map());
    const scMap = map.get(cat)!;
    if (!scMap.has(sc)) scMap.set(sc, new Map());
    const pgMap = scMap.get(sc)!;
    if (!pgMap.has(pg)) pgMap.set(pg, []);
    pgMap.get(pg)!.push(row);
  }

  const CATEGORY_ORDER = ["Groceries","Household","Personal Care","Medicine","Electronics","Dining","Travel","Entertainment","General"];
  const orderedCats = [...CATEGORY_ORDER.filter(c => map.has(c)), ...Array.from(map.keys()).filter(c => !CATEGORY_ORDER.includes(c))];

  const result = orderedCats.map(cat => {
    const scMap = map.get(cat)!;
    const taxOrder = SUBCATEGORY_TAXONOMY[cat] ?? SUBCATEGORY_TAXONOMY.General;
    const orderedSCs = [...taxOrder.filter(sc => scMap.has(sc)), ...Array.from(scMap.keys()).filter(sc => !taxOrder.includes(sc))];

    const subCategories = orderedSCs.map(sc => {
      const pgMap = scMap.get(sc)!;
      const products = Array.from(pgMap.entries()).map(([pg, entries]) => {
        const variantMap = new Map<string, typeof entries[number]>();
        for (const e of entries) {
          const normKey = e.itemNameNormalized.replace(/(\d+(?:\.\d+)?)\s+(lb|lbs|oz|fl\s*oz|kg|g|ml|gal|ct|pk|pack|count|gallon)/gi, (_, n, u) => n + u.replace(/\s+/g,"").toLowerCase());
          const vk = `${normKey}__${e.storeChain}`;
          if (!variantMap.has(vk)) variantMap.set(vk, e);
          else if (!variantMap.get(vk)!.unit && e.unit) variantMap.set(vk, e);
        }
        const variants = Array.from(variantMap.values())
          .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))
          .map(e => ({
            itemNameNormalized: e.itemNameNormalized,
            itemName: toTitleCase(e.itemNameNormalized.replace(/[™®©]/g, "")),
            storeChain: e.storeChain,
            unitPrice: Number(e.unitPrice),
            unit: e.unit ?? inferUnit(e.itemNameNormalized),
            capturedAt: e.capturedAt,
            isCheapest: false,
          }));
        const minPrice = Math.min(...variants.map(v => v.unitPrice));
        variants.forEach(v => { v.isCheapest = v.unitPrice === minPrice; });
        return { productGroup: pg, subCategory: sc, minPrice, maxPrice: Math.max(...variants.map(v => v.unitPrice)), storeCount: new Set(variants.map(v => v.storeChain)).size, variants };
      });
      return { subCategory: sc, products };
    }).filter(sc => sc.products.length > 0);

    return { category: cat, icon: CATEGORY_ICONS[cat] ?? "📦", subCategories };
  }).filter(c => c.subCategories.length > 0);

  return NextResponse.json(result);
}
