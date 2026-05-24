"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CategoryBreakdown {
  category: string;
  total: number;
}

interface CategoryPieProps {
  data: CategoryBreakdown[];
}

const COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { percent: number } }>;
}) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-slate-700">{item.name}</p>
        <p className="text-lg font-bold text-indigo-600">${item.value.toFixed(2)}</p>
        <p className="text-xs text-slate-400">
          {(item.payload.percent * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

export function CategoryPie({ data }: CategoryPieProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No category data available yet.
      </div>
    );
  }

  const dataWithPercent = data.map((d) => {
    const total = data.reduce((sum, item) => sum + item.total, 0);
    return { ...d, percent: d.total / total };
  });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={dataWithPercent}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={90}
          dataKey="total"
          nameKey="category"
          paddingAngle={2}
        >
          {dataWithPercent.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-slate-600">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
