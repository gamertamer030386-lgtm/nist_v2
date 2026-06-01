"use client";

const legendItems = [
  { color: "#22c55e", label: "No Gap (0)" },
  { color: "#eab308", label: "Gap 1" },
  { color: "#f97316", label: "Gap 2" },
  { color: "#ef4444", label: "Gap 3+" },
  { color: "#9ca3af", label: "Not Scored" },
];

export function HeatmapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className="h-4 w-4 rounded"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span className="text-sm text-gray-700">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
