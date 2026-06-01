"use client";

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";

interface FunctionRadarDataPoint {
  functionName: string;
  current: number;
  target: number;
}

interface FunctionRadarChartProps {
  data: FunctionRadarDataPoint[];
}

export function FunctionRadarChart({ data }: FunctionRadarChartProps) {
  if (data.length === 0 || data.every((d) => d.current === 0 && d.target === 0)) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        <p>No scores available yet. Score subcategories to see the radar chart.</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="functionName"
            tick={{ fontSize: 12, fill: "#374151" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fontSize: 10, fill: "#6b7280" }}
            tickCount={6}
          />
          <Radar
            name="Current"
            dataKey="current"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.2}
          />
          <Radar
            name="Target"
            dataKey="target"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.15}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
