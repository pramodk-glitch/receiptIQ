"use client";

import { useState } from "react";
import Link from "next/link";

export interface ReceiptSummary {
  id: string;
  storeName: string;
  receiptDate: string;   // ISO date string YYYY-MM-DD
  totalAmount: number;
  currency: string;
  itemCount: number;
  source: string;
  needsReview: boolean;
}

interface Props { receipts: ReceiptSummary[]; }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(amount);
}

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual", upload: "Upload", amazon_csv: "Amazon", lambda_ocr: "AI Scan",
};

function StoreIcon() {
  return (
    <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
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

export function ReceiptStoreTree({ receipts }: Props) {
  // Group by storeName, sorted by most-recent receipt date per store
  const storeMap = new Map<string, ReceiptSummary[]>();
  for (const r of receipts) {
    if (!storeMap.has(r.storeName)) storeMap.set(r.storeName, []);
    storeMap.get(r.storeName)!.push(r);
  }
  // Sort each store's receipts newest-first
  const stores = Array.from(storeMap.entries()).map(([name, rows]) => ({
    name,
    rows: rows.sort((a, b) => b.receiptDate.localeCompare(a.receiptDate)),
    latestDate: rows.reduce((m, r) => r.receiptDate > m ? r.receiptDate : m, ""),
    total: rows.reduce((s, r) => s + r.totalAmount, 0),
    currency: rows[0].currency,
  }));
  // Sort stores by most-recent receipt (stores with newest receipts first)
  stores.sort((a, b) => b.latestDate.localeCompare(a.latestDate));

  const [openStores, setOpenStores] = useState<Set<string>>(() => new Set(stores.slice(0, 1).map(s => s.name)));

  function toggle(name: string) {
    setOpenStores(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  if (stores.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-12">
        No receipts yet. Upload your first receipt to get started.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {stores.map(store => {
        const open = openStores.has(store.name);
        return (
          <div key={store.name} className="border border-slate-200 rounded-xl overflow-hidden">
            {/* Store header */}
            <button onClick={() => toggle(store.name)}
              className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
              <ToggleIcon open={open} />
              <StoreIcon />
              <span className="font-semibold text-slate-800 flex-1 min-w-0 truncate">{store.name}</span>
              <span className="text-xs text-slate-400 shrink-0">
                {store.rows.length} receipt{store.rows.length !== 1 ? "s" : ""}
              </span>
              <span className="text-sm font-bold text-slate-700 shrink-0 ml-2">
                {formatAmount(store.total, store.currency)} total
              </span>
            </button>

            {open && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[320px]">
                  <thead>
                    <tr className="text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
                      <th className="text-left px-4 py-2">Date</th>
                      <th className="text-left px-3 py-2 hidden sm:table-cell">Source</th>
                      <th className="text-right px-3 py-2">Items</th>
                      <th className="text-right px-4 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {store.rows.map(r => (
                      <tr key={r.id}
                        className="hover:bg-indigo-50 transition-colors group">
                        <td className="px-4 py-2.5">
                          <Link href={`/receipts/${r.id}`}
                            className="text-indigo-600 hover:underline font-medium">
                            {formatDate(r.receiptDate)}
                          </Link>
                          {r.needsReview && (
                            <span className="ml-2 text-xs font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                              Review
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-slate-400 text-xs hidden sm:table-cell">
                          {SOURCE_LABELS[r.source] ?? r.source}
                        </td>
                        <td className="px-3 py-2.5 text-right text-slate-500">
                          {r.itemCount}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-slate-800">
                          {formatAmount(r.totalAmount, r.currency)}
                        </td>
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
  );
}
