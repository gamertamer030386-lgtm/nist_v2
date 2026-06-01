"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { CategoryRollupData } from "./FunctionSummaryTable";

interface FunctionBarChartProps {
  functionName: string;
  categories: CategoryRollupData[];
}

export function FunctionBarChart({ functionName, categories }: FunctionBarChartProps) {
  const chartData = categories.map((cat) => ({
    name: cat.categoryId,
    current: cat.rollup.currentScore ?? 0,
    target: cat.rollup.targetScore ?? 0,
  }));

  if (chartData.length === 0 || chartData.every((d) => d.current === 0 && d.target === 0)) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        <p>No scores available for {functionName}.</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#374151" }}
            axisLine={{ stroke: "#d1d5db" }}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4, 5]}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={{ stroke: "#d1d5db" }}
          />
          <Tooltip
            contentStyle={{
              fontSize: "12px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Bar
            dataKey="current"
            name="Current"
            fill="#4f46e5"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            dataKey="target"
            name="Target"
            fill="#10b981"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
