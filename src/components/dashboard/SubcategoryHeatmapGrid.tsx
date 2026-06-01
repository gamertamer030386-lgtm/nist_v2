"use client";

import { useState } from "react";

interface HeatmapItem {
  id: string;
  currentScore: number | null;
  gap: number | null;
  description?: string;
  categoryName?: string;
  functionName?: string;
}

interface Props {
  items: HeatmapItem[];
  overallScore: number | null;
}

export default function SubcategoryHeatmapGrid({ items, overallScore }: Props) {
  const [selectedItem, setSelectedItem] = useState<HeatmapItem | null>(null);

  return (
    <>
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <p className="text-sm font-semibold text-gray-700">Heatmap per Control ID</p>
        <p className="text-xs text-gray-400">Overall: <span className="font-bold text-purple-700">{overallScore?.toFixed(1) ?? "—"}</span>/5</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-10 gap-0">
          {items.map((item) => {
            let bgColor = "bg-gray-200";
            let textColor = "text-gray-500";
            if (item.gap !== null) {
              if (item.gap >= 3) { bgColor = "bg-red-500"; textColor = "text-white"; }
              else if (item.gap >= 2) { bgColor = "bg-yellow-400"; textColor = "text-gray-900"; }
              else if (item.gap >= 1) { bgColor = "bg-green-300"; textColor = "text-gray-900"; }
              else { bgColor = "bg-green-500"; textColor = "text-white"; }
            }
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`${bgColor} ${textColor} aspect-square rounded-sm flex flex-col items-center justify-center text-center cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-purple-400 transition-all`}
                title={`${item.id} — Score: ${item.currentScore ?? "N/A"} | Gap: ${item.gap ?? "N/A"}`}
              >
                <span className="text-[7px] font-bold leading-none">{item.id.replace(/^[A-Z]+\./, "")}</span>
                <span className="text-[9px] font-semibold">{item.currentScore ?? "—"}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-red-500" /><span className="text-[8px] text-gray-500">High (3+)</span></div>
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-yellow-400" /><span className="text-[8px] text-gray-500">Med (2)</span></div>
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-green-400" /><span className="text-[8px] text-gray-500">Low (0-1)</span></div>
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-gray-200" /><span className="text-[8px] text-gray-500">N/A</span></div>
      </div>

      {/* Popup Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-purple-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-purple-900">{selectedItem.id}</h3>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {selectedItem.functionName && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Function</p>
                  <p className="text-sm text-gray-800">{selectedItem.functionName}</p>
                </div>
              )}
              {selectedItem.categoryName && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Category</p>
                  <p className="text-sm text-gray-800">{selectedItem.categoryName}</p>
                </div>
              )}
              {selectedItem.description && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedItem.description}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Current Score</p>
                  <p className="text-2xl font-bold text-purple-700">{selectedItem.currentScore ?? "—"}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Target</p>
                  <p className="text-2xl font-bold text-gray-400">5</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Gap</p>
                  <p className={`text-2xl font-bold ${
                    selectedItem.gap !== null && selectedItem.gap >= 3 ? "text-red-600" :
                    selectedItem.gap !== null && selectedItem.gap >= 2 ? "text-yellow-600" :
                    "text-green-600"
                  }`}>{selectedItem.gap ?? "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
