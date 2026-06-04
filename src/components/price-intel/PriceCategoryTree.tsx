"use client";

import { useState, useMemo } from "react";

interface StorePrice {
  storeChain: string;
  avgPrice: number;
  minPrice: number;
  purchases: number;
  isCheapest: boolean;
}

interface CategoryItem {
  itemNameNormalized: string;
  category: string;
  stores: StorePrice[];
  bestPrice: number;
  multiStore: boolean;
}

interface CategoryGroup {
  category: string;
  items: CategoryItem[];
}

interface Props {
  data: CategoryGroup[];
}

const CATEGORY_ICONS: Record<string, string> = {
  Groceries: "🛒",
  Electronics: "⚡",
  Dining: "🍽️",
  Medicine: "💊",
  Household: "🏠",
  "Personal Care": "🧴",
  Travel: "✈️",
  Entertainment: "🎬",
  General: "📦",
};

export function PriceCategoryTree({ data }: Props) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set(data.map((g) => g.category))
  );
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.itemNameNormalized.includes(q) ||
          item.stores.some((s) => s.storeChain.toLowerCase().includes(q))
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [data, search]);

  const totalItems = data.reduce((sum, g) => sum + g.items.length, 0);

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  if (totalItems === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-12">
        No price history yet. Upload receipts to start tracking prices.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search items or stores…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Tree */}
      <div className="space-y-2">
        {filtered.map((group) => {
          const isOpen = search.trim() ? true : openCategories.has(group.category);
          const icon = CATEGORY_ICONS[group.category] ?? "📦";
          const multiStoreCount = group.items.filter((i) => i.multiStore).length;

          return (
            <div key={group.category} className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(group.category)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <span className="text-lg">{icon}</span>
                <span className="font-semibold text-slate-800 flex-1">{group.category}</span>
                <span className="text-xs text-slate-500 mr-2">{group.items.length} item{group.items.length !== 1 ? "s" : ""}</span>
                {multiStoreCount > 0 && (
                  <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full mr-2">
                    {multiStoreCount} multi-store
                  </span>
                )}
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Items */}
              {isOpen && (
                <div className="divide-y divide-slate-100">
                  {group.items.map((item) => {
                    const itemKey = `${group.category}__${item.itemNameNormalized}`;
                    const isItemOpen = expandedItem === itemKey;

                    return (
                      <div key={item.itemNameNormalized}>
                        <button
                          onClick={() => setExpandedItem(isItemOpen ? null : itemKey)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 transition-colors text-left"
                        >
                          {/* Tree indent line */}
                          <span className="text-slate-300 text-xs select-none pl-2">├─</span>

                          <span className="flex-1 text-sm text-slate-700 capitalize truncate">
                            {item.itemNameNormalized}
                          </span>

                          {item.multiStore ? (
                            <span className="shrink-0 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                              Save ${(item.stores[item.stores.length - 1].avgPrice - item.bestPrice).toFixed(2)}
                            </span>
                          ) : (
                            <span className="shrink-0 text-xs text-slate-500">
                              {item.stores[0].storeChain || "Unknown"}
                            </span>
                          )}

                          <span className="shrink-0 text-sm font-semibold text-slate-800 w-16 text-right">
                            ${item.bestPrice.toFixed(2)}
                          </span>

                          <svg
                            className={`w-3.5 h-3.5 text-slate-300 transition-transform ${isItemOpen ? "rotate-180" : ""}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Store breakdown */}
                        {isItemOpen && (
                          <div className="pl-12 pr-4 pb-3 bg-slate-50">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-slate-400 uppercase">
                                  <th className="text-left py-1.5">Store</th>
                                  <th className="text-right py-1.5">Avg</th>
                                  <th className="text-right py-1.5">Best</th>
                                  <th className="text-right py-1.5">Trips</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.stores.map((store) => (
                                  <tr
                                    key={store.storeChain}
                                    className={`border-t border-slate-200 ${store.isCheapest ? "text-green-700 font-medium" : "text-slate-600"}`}
                                  >
                                    <td className="py-1.5 flex items-center gap-1">
                                      {store.isCheapest && <span className="text-green-500">★</span>}
                                      {store.storeChain || "Unknown"}
                                    </td>
                                    <td className="text-right py-1.5">${store.avgPrice.toFixed(2)}</td>
                                    <td className="text-right py-1.5">${store.minPrice.toFixed(2)}</td>
                                    <td className="text-right py-1.5">{store.purchases}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
