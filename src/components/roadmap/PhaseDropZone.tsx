"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DraggableCard, { type RecommendationCardData } from "./DraggableCard";

interface PhaseDropZoneProps {
  phaseId: string;
  title: string;
  timeRange: string;
  recommendations: RecommendationCardData[];
  accentColor: string;
}

export default function PhaseDropZone({
  phaseId,
  title,
  timeRange,
  recommendations,
  accentColor,
}: PhaseDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id: phaseId });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-lg border-2 transition-colors ${
        isOver ? "border-indigo-400 bg-indigo-50/50" : "border-gray-200 bg-gray-50"
      }`}
    >
      {/* Phase header */}
      <div className={`rounded-t-md px-4 py-3 ${accentColor}`}>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-white/80">{timeRange}</p>
      </div>

      {/* Count badge */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <span className="text-xs text-gray-500">
          {recommendations.length} item{recommendations.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Cards container */}
      <div className="flex-1 space-y-2 overflow-y-auto p-3 min-h-[200px]">
        <SortableContext
          items={recommendations.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          {recommendations.map((rec) => (
            <DraggableCard key={rec.id} recommendation={rec} />
          ))}
        </SortableContext>

        {recommendations.length === 0 && (
          <div className="flex h-full items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-4">
            <p className="text-center text-xs text-gray-400">
              Drop recommendations here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
