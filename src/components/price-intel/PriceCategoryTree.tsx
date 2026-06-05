"use client";

import { useState, useMemo } from "react";
import type { CategoryNode, SubCategoryNode, ProductGroup, PriceTrend } from "@/types/price-intel";

interface Props { data: CategoryNode[]; }

// ── Helpers ───────────────────────────────────────────────────────────────────
function TrendBadge({ trend }: { trend: PriceTrend }) {
  if (trend.direction === "new")
    return <span className="text-xs text-slate-400">New</span>;
  if (trend.direction === "stable")
    return <span className="text-xs text-slate-500">→ Stable</span>;
  const up = trend.direction === "up";
  return (
    <span className={`text-xs font-semibold ${up ? "text-red-600" : "text-green-600"}`}>
      {up ? "↑" : "↓"} {Math.abs(trend.pct)}%
    </span>
  );
}

function ToggleIcon({ open }: { open: boolean }) {
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded border text-xs font-bold shrink-0
      ${open ? "border-indigo-400 bg-indigo-50 text-indigo-600" : "border-slate-300 bg-white text-slate-500"}`}>
      {open ? "−" : "+"}
    </span>
  );
}

// ── Level 3: Product row ──────────────────────────────────────────────────────
function ProductRow({ product, open, onToggle }: { product: ProductGroup; open: boolean; onToggle: () => void }) {
  const savings = product.storeCount > 1 ? (product.maxPrice - product.minPrice).toFixed(2) : null;

  return (
    <div>
      <button onClick={onToggle}
        className="w-full flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 transition-colors text-left">
        <span className="text-slate-200 text-xs select-none pl-6">│</span>
        <span className="text-slate-200 text-xs select-none">│</span>
        <ToggleIcon open={open} />
        <span className="flex-1 text-sm font-medium text-slate-700 truncate">{product.productGroup}</span>
        {product.storeCount > 1 && (
          <span className="shrink-0 text-xs text-slate-400">{product.storeCount} stores</span>
        )}
        {savings && (
          <span className="shrink-0 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
            Save ${savings}
          </span>
        )}
        <span className="shrink-0 w-20 text-right"><TrendBadge trend={product.trend} /></span>
        <span className="shrink-0 text-sm font-bold text-slate-800 w-16 text-right">
          ${product.minPrice.toFixed(2)}
        </span>
      </button>

      {open && (
        <div className="ml-16 mr-4 mb-2 rounded-lg border border-slate-100 overflow-hidden bg-slate-50">
          {/* Trend detail */}
          {product.trend.previousPrice !== null && (
            <div className={`px-4 py-1.5 text-xs flex items-center gap-2 border-b border-slate-100
              ${product.trend.direction === "up" ? "bg-red-50 text-red-700"
              : product.trend.direction === "down" ? "bg-green-50 text-green-700"
              : "bg-slate-50 text-slate-500"}`}>
              <TrendBadge trend={product.trend} />
              <span>
                ${product.trend.previousPrice.toFixed(2)} → ${product.trend.currentPrice.toFixed(2)}
                {product.trend.previousDate && (
                  <span className="ml-1 opacity-60">({product.trend.previousDate} → {product.trend.currentDate})</span>
                )}
              </span>
            </div>
          )}
          {/* Variants table */}
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 uppercase tracking-wide">
                <th className="text-left px-4 py-1.5">Item</th>
                <th className="text-left px-2 py-1.5">Store</th>
                <th className="text-right px-4 py-1.5">Price</th>
                <th className="text-right px-4 py-1.5 hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {product.variants.map((v, i) => (
                <tr key={`${v.itemNameNormalized}-${v.storeChain}-${i}`}
                  className={v.isCheapest ? "bg-green-50" : "bg-white"}>
                  <td className="px-4 py-1.5 text-slate-700 max-w-[180px] truncate">
                    {v.isCheapest && <span className="text-green-500 mr-1">★</span>}
                    {v.itemName}
                  </td>
                  <td className="px-2 py-1.5 text-slate-600 whitespace-nowrap">{v.storeChain}</td>
                  <td className={`text-right px-4 py-1.5 font-semibold ${v.isCheapest ? "text-green-700" : "text-slate-800"}`}>
                    ${v.unitPrice.toFixed(2)}
                  </td>
                  <td className="text-right px-4 py-1.5 text-slate-400 hidden sm:table-cell">{v.capturedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Level 2: Sub-category row ─────────────────────────────────────────────────
function SubCategoryRow({ node, openProducts, onToggleSC, onToggleProduct, searchActive }: {
  node: SubCategoryNode;
  openProducts: Set<string>;
  onToggleSC: () => void;
  onToggleProduct: (key: string) => void;
  isOpen: boolean;
  searchActive: boolean;
}) {
  const multiStoreCount = node.products.filter(p => p.storeCount > 1).length;

  return (
    <div>
      <button onClick={onToggleSC}
        className="w-full flex items-center gap-2 px-4 py-2 bg-slate-50/80 hover:bg-slate-100 transition-colors text-left border-t border-slate-100">
        <span className="text-slate-200 text-xs select-none pl-4">│</span>
        <ToggleIcon open={openProducts.size >= 0 /* controlled externally */} />
        <span className="flex-1 text-sm font-semibold text-slate-600">{node.subCategory}</span>
        <span className="text-xs text-slate-400 mr-1">{node.productCount} product{node.productCount !== 1 ? "s" : ""}</span>
        {multiStoreCount > 0 && (
          <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            {multiStoreCount} multi-store
          </span>
        )}
      </button>
    </div>
  );
}

// ── Main tree ─────────────────────────────────────────────────────────────────
export function PriceCategoryTree({ data }: Props) {
  const [openCats, setOpenCats]       = useState<Set<string>>(() => new Set(data.slice(0, 1).map(n => n.category)));
  const [openSCs, setOpenSCs]         = useState<Set<string>>(new Set());
  const [openProducts, setOpenProducts] = useState<Set<string>>(new Set());
  const [search, setSearch]           = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.map(node => ({
      ...node,
      subCategories: node.subCategories.map(sc => ({
        ...sc,
        products: sc.products.filter(p =>
          p.productGroup.toLowerCase().includes(q) ||
          p.variants.some(v => v.itemName.toLowerCase().includes(q) || v.storeChain.toLowerCase().includes(q))
        ),
      })).filter(sc => sc.products.length > 0),
    })).filter(node => node.subCategories.length > 0);
  }, [data, search]);

  const totalProducts = data.reduce((s, n) => s + n.productCount, 0);

  const toggle = (set: Set<string>, key: string): Set<string> => {
    const next = new Set(set);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  };

  if (totalProducts === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-12">
        No price history yet. Upload receipts to start tracking prices.
      </p>
    );
  }

  const searchActive = search.trim().length > 0;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search products, stores…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 px-1">
        <span className="flex items-center gap-1"><span className="text-red-600 font-semibold">↑</span> Price up</span>
        <span className="flex items-center gap-1"><span className="text-green-600 font-semibold">↓</span> Price down</span>
        <span className="flex items-center gap-1"><span className="text-green-500">★</span> Cheapest</span>
        <span className="flex items-center gap-1"><span className="font-bold text-indigo-500">+</span> Expand</span>
      </div>

      {/* Tree */}
      <div className="space-y-2">
        {filtered.map(node => {
          const catOpen = searchActive || openCats.has(node.category);
          const multiStoreTotal = node.subCategories.reduce((s, sc) => s + sc.products.filter(p => p.storeCount > 1).length, 0);

          return (
            <div key={node.category} className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Level 1 — Category */}
              <button onClick={() => setOpenCats(toggle(openCats, node.category))}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
                <ToggleIcon open={catOpen} />
                <span className="text-lg">{node.icon}</span>
                <span className="font-semibold text-slate-800 flex-1">{node.category}</span>
                <span className="text-xs text-slate-400 mr-1">{node.productCount} product{node.productCount !== 1 ? "s" : ""}</span>
                {multiStoreTotal > 0 && (
                  <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {multiStoreTotal} multi-store
                  </span>
                )}
              </button>

              {catOpen && (
                <div className="divide-y divide-slate-100">
                  {node.subCategories.map(sc => {
                    const scKey = `${node.category}__${sc.subCategory}`;
                    const scOpen = searchActive || openSCs.has(scKey);

                    return (
                      <div key={scKey}>
                        {/* Level 2 — Sub-category */}
                        <button onClick={() => setOpenSCs(toggle(openSCs, scKey))}
                          className="w-full flex items-center gap-2 px-4 py-2.5 bg-slate-50/60 hover:bg-slate-100 transition-colors text-left">
                          <span className="text-slate-200 text-xs select-none pl-4">│</span>
                          <ToggleIcon open={scOpen} />
                          <span className="flex-1 text-sm font-semibold text-slate-600">{sc.subCategory}</span>
                          <span className="text-xs text-slate-400">{sc.productCount} product{sc.productCount !== 1 ? "s" : ""}</span>
                          {sc.products.filter(p => p.storeCount > 1).length > 0 && (
                            <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-1">
                              {sc.products.filter(p => p.storeCount > 1).length} multi-store
                            </span>
                          )}
                        </button>

                        {/* Level 3 — Products */}
                        {scOpen && (
                          <div className="divide-y divide-slate-50">
                            {sc.products.map(product => {
                              const pgKey = `${scKey}__${product.productGroup}`;
                              return (
                                <ProductRow
                                  key={pgKey}
                                  product={product}
                                  open={searchActive || openProducts.has(pgKey)}
                                  onToggle={() => setOpenProducts(toggle(openProducts, pgKey))}
                                />
                              );
                            })}
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
