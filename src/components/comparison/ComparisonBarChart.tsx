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
import type { ComparisonResponse } from "@/app/api/assessments/compare/route";

// Distinct colors for up to 6 assessments
const ASSESSMENT_COLORS = [
  "#4f46e5", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
];

interface ComparisonBarChartProps {
  data: ComparisonResponse;
}

export default function ComparisonBarChart({ data }: ComparisonBarChartProps) {
  const { assessments } = data;

  if (assessments.length === 0) return null;

  // Build chart data: one entry per function, with each assessment's score as a key
  const chartData = assessments[0].functions.map((fn, fnIdx) => {
    const entry: Record<string, string | number> = { name: fn.name };
    assessments.forEach((a) => {
      const score = a.functions[fnIdx]?.rollup.currentScore;
      entry[a.id] = score ?? 0;
    });
    return entry;
  });

  // Check if there's any data to display
  const hasData = chartData.some((entry) =>
    assessments.some((a) => (entry[a.id] as number) > 0)
  );

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        <p>No scores available for comparison.</p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
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
          {assessments.map((a, idx) => (
            <Bar
              key={a.id}
              dataKey={a.id}
              name={`${a.name} (${new Date(a.createdAt).toLocaleDateString()})`}
              fill={ASSESSMENT_COLORS[idx % ASSESSMENT_COLORS.length]}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
