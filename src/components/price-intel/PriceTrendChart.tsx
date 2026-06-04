"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TrendRow {
  week: string;
  storeChain: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  dataPoints: number;
}

interface ChartPoint {
  week: string;
  [storeChain: string]: string | number;
}

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface Props {
  topItems: string[];
}

export function PriceTrendChart({ topItems }: Props) {
  const [selectedItem, setSelectedItem] = useState(topItems[0] ?? "");
  const [rows, setRows] = useState<TrendRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const fetchTrend = useCallback(async (item: string) => {
    if (!item) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/price-history/trend?item=${encodeURIComponent(item)}`);
      if (res.ok) setRows(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedItem) fetchTrend(selectedItem);
  }, [selectedItem, fetchTrend]);

  const stores = Array.from(new Set(rows.map((r) => r.storeChain))).filter(Boolean);

  const chartData: ChartPoint[] = [];
  const weekMap: Record<string, ChartPoint> = {};
  for (const row of rows) {
    if (!weekMap[row.week]) {
      weekMap[row.week] = { week: row.week.slice(5) }; // MM-DD
    }
    weekMap[row.week][row.storeChain] = Number(row.avgPrice.toFixed(2));
  }
  chartData.push(...Object.values(weekMap).sort((a, b) => (a.week < b.week ? -1 : 1)));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm font-medium text-slate-700">Track item:</label>
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {topItems.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        {loading && <span className="text-xs text-slate-400">Loading…</span>}
      </div>

      {!mounted || loading ? (
        <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
          {loading ? "Loading trend data…" : ""}
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
          No price history for this item in the last 12 months.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 5, right: 16, left: 8, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              formatter={(v: number) => [`$${v.toFixed(2)}`, ""]}
              labelFormatter={(l) => `Week of ${l}`}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {stores.map((store, i) => (
              <Line
                key={store}
                type="monotone"
                dataKey={store}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
