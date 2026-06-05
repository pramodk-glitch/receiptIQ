"use client";

import { useState, useMemo } from "react";
import type { CategoryNode, ProductGroup, PriceTrend } from "@/types/price-intel";

interface Props {
  data: CategoryNode[];
}

// ── Trend badge ───────────────────────────────────────────────────────────────
function TrendBadge({ trend }: { trend: PriceTrend }) {
  if (trend.direction === "new") {
    return <span className="text-xs text-slate-400 font-medium">New</span>;
  }
  if (trend.direction === "stable") {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-500">
        <span>→</span>
        <span>Stable</span>
      </span>
    );
  }
  const isUp = trend.direction === "up";
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isUp ? "text-red-600" : "text-green-600"}`}>
      <span>{isUp ? "↑" : "↓"}</span>
      <span>{Math.abs(trend.pct)}%</span>
    </span>
  );
}

// ── Toggle button (+/-) ────────────────────────────────────────────────────────
function ToggleIcon({ open }: { open: boolean }) {
  return (
    <span className={`
      inline-flex items-center justify-center w-5 h-5 rounded border text-xs font-bold shrink-0 transition-colors
      ${open ? "border-indigo-400 bg-indigo-50 text-indigo-600" : "border-slate-300 bg-white text-slate-500 hover:border-indigo-300"}
    `}>
      {open ? "−" : "+"}
    </span>
  );
}

// ── Product row (Level 2) ──────────────────────────────────────────────────────
function ProductRow({ product, isOpen, onToggle }: {
  product: ProductGroup;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const savings = product.storeCount > 1
    ? (product.maxPrice - product.minPrice).toFixed(2)
    : null;

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 transition-colors text-left group"
      >
        {/* Indent + toggle */}
        <span className="text-slate-200 text-xs select-none w-4">│</span>
        <ToggleIcon open={isOpen} />

        {/* Product name */}
        <span className="flex-1 text-sm font-medium text-slate-700 truncate">
          {product.productGroup}
        </span>

        {/* Store count */}
        {product.storeCount > 1 && (
          <span className="shrink-0 text-xs text-slate-400">
            {product.storeCount} stores
          </span>
        )}

        {/* Savings badge */}
        {savings && (
          <span className="shrink-0 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
            Save ${savings}
          </span>
        )}

        {/* Trend */}
        <span className="shrink-0 w-20 text-right">
          <TrendBadge trend={product.trend} />
        </span>

        {/* Best price */}
        <span className="shrink-0 text-sm font-bold text-slate-800 w-16 text-right">
          ${product.minPrice.toFixed(2)}
        </span>
      </button>

      {/* Level 3: Variants ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="ml-12 mr-4 mb-3 rounded-lg border border-slate-100 overflow-hidden bg-slate-50">
          {/* Trend detail row */}
          {product.trend.previousPrice !== null && (
            <div className={`px-4 py-2 text-xs border-b border-slate-100 flex items-center gap-2 ${
              product.trend.direction === "up" ? "bg-red-50 text-red-700"
              : product.trend.direction === "down" ? "bg-green-50 text-green-700"
              : "bg-slate-50 text-slate-500"
            }`}>
              <TrendBadge trend={product.trend} />
              <span>
                {product.trend.direction === "up" ? "Price increased" :
                 product.trend.direction === "down" ? "Price decreased" : "Price stable"}
                {" "}from ${product.trend.previousPrice.toFixed(2)} → ${product.trend.currentPrice.toFixed(2)}
                {product.trend.previousDate && (
                  <span className="ml-1 opacity-60">
                    (was {product.trend.previousDate}, now {product.trend.currentDate})
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Variant table */}
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 uppercase tracking-wide">
                <th className="text-left px-4 py-2">Item</th>
                <th className="text-left px-2 py-2">Store</th>
                <th className="text-right px-4 py-2">Price</th>
                <th className="text-right px-4 py-2 hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {product.variants.map((v, i) => (
                <tr
                  key={`${v.itemNameNormalized}-${v.storeChain}-${i}`}
                  className={v.isCheapest ? "bg-green-50" : "bg-white"}
                >
                  <td className="px-4 py-2 text-slate-700 max-w-[180px] truncate">
                    {v.isCheapest && <span className="text-green-500 mr-1">★</span>}
                    {v.itemName}
                  </td>
                  <td className="px-2 py-2 text-slate-600 whitespace-nowrap">{v.storeChain}</td>
                  <td className={`text-right px-4 py-2 font-semibold ${v.isCheapest ? "text-green-700" : "text-slate-800"}`}>
                    ${v.unitPrice.toFixed(2)}
                  </td>
                  <td className="text-right px-4 py-2 text-slate-400 hidden sm:table-cell whitespace-nowrap">
                    {v.capturedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main tree ─────────────────────────────────────────────────────────────────
export function PriceCategoryTree({ data }: Props) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set(data.slice(0, 1).map((n) => n.category)) // open first category by default
  );
  const [openProducts, setOpenProducts] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data
      .map((node) => ({
        ...node,
        products: node.products.filter(
          (p) =>
            p.productGroup.toLowerCase().includes(q) ||
            p.variants.some(
              (v) => v.itemName.toLowerCase().includes(q) || v.storeChain.toLowerCase().includes(q)
            )
        ),
      }))
      .filter((node) => node.products.length > 0);
  }, [data, search]);

  const totalProducts = data.reduce((s, n) => s + n.productCount, 0);

  const toggleCategory = (cat: string) =>
    setOpenCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  const toggleProduct = (key: string) =>
    setOpenProducts((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  if (totalProducts === 0) {
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
          placeholder="Search products, stores…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-400 px-1">
        <span className="flex items-center gap-1"><span className="text-red-600 font-semibold">↑</span> Price up</span>
        <span className="flex items-center gap-1"><span className="text-green-600 font-semibold">↓</span> Price down</span>
        <span className="flex items-center gap-1"><span className="text-green-500">★</span> Cheapest option</span>
        <span className="flex items-center gap-1"><span className="font-bold text-indigo-500">+</span> Expand</span>
      </div>

      {/* Tree */}
      <div className="space-y-2">
        {filtered.map((node) => {
          const isCatOpen = search.trim() ? true : openCategories.has(node.category);
          const multiStoreCount = node.products.filter((p) => p.storeCount > 1).length;

          return (
            <div key={node.category} className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Level 1: Category */}
              <button
                onClick={() => toggleCategory(node.category)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <ToggleIcon open={isCatOpen} />
                <span className="text-lg">{node.icon}</span>
                <span className="font-semibold text-slate-800 flex-1">{node.category}</span>
                <span className="text-xs text-slate-400 mr-1">
                  {node.productCount} product{node.productCount !== 1 ? "s" : ""}
                </span>
                {multiStoreCount > 0 && (
                  <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {multiStoreCount} multi-store
                  </span>
                )}
              </button>

              {/* Level 2: Products */}
              {isCatOpen && (
                <div className="divide-y divide-slate-100">
                  {node.products.map((product) => {
                    const key = `${node.category}__${product.productGroup}`;
                    return (
                      <ProductRow
                        key={key}
                        product={product}
                        isOpen={search.trim() ? true : openProducts.has(key)}
                        onToggle={() => toggleProduct(key)}
                      />
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
