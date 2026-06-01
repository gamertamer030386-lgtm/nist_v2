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

interface DashboardRadarChartProps {
  data: { name: string; current: number; target: number }[];
}

export default function DashboardRadarChart({ data }: DashboardRadarChartProps) {
  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e9d5ff" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#6b21a8" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fontSize: 9, fill: "#9ca3af" }}
            tickCount={6}
          />
          <Radar
            name="Current"
            dataKey="current"
            stroke="#7c3aed"
            fill="#7c3aed"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Target (5.0)"
            dataKey="target"
            stroke="#a855f7"
            fill="#a855f7"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Legend
            wrapperStyle={{ fontSize: "11px" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
