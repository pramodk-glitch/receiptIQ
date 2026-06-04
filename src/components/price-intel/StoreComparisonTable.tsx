"use client";

import { useState } from "react";

interface StoreEntry {
  storeChain: string;
  avgPrice: number;
  minPrice: number;
  purchases: number;
  isCheapest: boolean;
}

interface ItemComparison {
  itemNameNormalized: string;
  stores: StoreEntry[];
  savings: number;
}

interface Props {
  data: ItemComparison[];
}

export function StoreComparisonTable({ data }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = data.filter((d) =>
    d.itemNameNormalized.includes(search.toLowerCase())
  );

  if (data.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-8">
        Not enough data yet. Purchase the same item from multiple stores to see comparisons.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search items…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {filtered.map((item) => (
          <div
            key={item.itemNameNormalized}
            className="border border-slate-200 rounded-lg overflow-hidden"
          >
            <button
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 text-left transition-colors"
              onClick={() =>
                setExpanded(expanded === item.itemNameNormalized ? null : item.itemNameNormalized)
              }
            >
              <span className="text-sm font-medium text-slate-800 capitalize truncate max-w-xs">
                {item.itemNameNormalized}
              </span>
              <span className="ml-4 shrink-0 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                Save up to ${item.savings.toFixed(2)}
              </span>
            </button>
            {expanded === item.itemNameNormalized && (
              <div className="border-t border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                      <th className="px-4 py-2 text-left">Store</th>
                      <th className="px-4 py-2 text-right">Avg Price</th>
                      <th className="px-4 py-2 text-right">Best Price</th>
                      <th className="px-4 py-2 text-right">Purchases</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.stores.map((store) => (
                      <tr
                        key={store.storeChain}
                        className={`border-t border-slate-100 ${store.isCheapest ? "bg-green-50" : "bg-white"}`}
                      >
                        <td className="px-4 py-2 font-medium text-slate-700 flex items-center gap-1">
                          {store.isCheapest && (
                            <span className="text-green-500 text-xs">★</span>
                          )}
                          {store.storeChain || "Unknown"}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-700">
                          ${store.avgPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-500">
                          ${store.minPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-400">
                          {store.purchases}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
