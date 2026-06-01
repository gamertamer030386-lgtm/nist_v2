"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ControlCategory, PriorityLevel, EffortLevel } from "@prisma/client";

export interface RecommendationCardData {
  id: string;
  subcategoryId: string;
  description: string;
  category: ControlCategory;
  priorityLevel: PriorityLevel;
  effortLevel: EffortLevel;
  priorityScore: number;
  roadmapPhase: string;
  dependsOnId: string | null;
}

interface DraggableCardProps {
  recommendation: RecommendationCardData;
}

const CATEGORY_BADGES: Record<ControlCategory, { label: string; className: string }> = {
  PEOPLE: { label: "People", className: "bg-blue-100 text-blue-800" },
  TOOLS: { label: "Tools", className: "bg-purple-100 text-purple-800" },
  PROCESS: { label: "Process", className: "bg-teal-100 text-teal-800" },
  PARTNERS: { label: "Partners", className: "bg-amber-100 text-amber-800" },
};

const PRIORITY_BADGES: Record<PriorityLevel, { label: string; className: string }> = {
  CRITICAL: { label: "Critical", className: "bg-red-100 text-red-800" },
  HIGH: { label: "High", className: "bg-orange-100 text-orange-800" },
  MEDIUM: { label: "Medium", className: "bg-yellow-100 text-yellow-800" },
  LOW: { label: "Low", className: "bg-green-100 text-green-800" },
};

const EFFORT_BADGES: Record<EffortLevel, { label: string; className: string }> = {
  LOW: { label: "Low Effort", className: "bg-emerald-50 text-emerald-700" },
  MEDIUM: { label: "Med Effort", className: "bg-slate-100 text-slate-700" },
  HIGH: { label: "High Effort", className: "bg-rose-50 text-rose-700" },
};

export default function DraggableCard({ recommendation }: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: recommendation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const categoryBadge = CATEGORY_BADGES[recommendation.category];
  const priorityBadge = PRIORITY_BADGES[recommendation.priorityLevel];
  const effortBadge = EFFORT_BADGES[recommendation.effortLevel];

  // Truncate description to ~80 chars
  const truncatedDescription =
    recommendation.description.length > 80
      ? recommendation.description.slice(0, 80) + "…"
      : recommendation.description;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
        isDragging ? "shadow-lg ring-2 ring-indigo-300" : ""
      }`}
      aria-label={`Recommendation ${recommendation.subcategoryId}: ${truncatedDescription}`}
    >
      {/* Header: subcategory ID + dependency indicator */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-indigo-700">
          {recommendation.subcategoryId}
        </span>
        {recommendation.dependsOnId && (
          <span
            className="inline-flex items-center gap-0.5 text-xs text-gray-500"
            title="Has dependency"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.06a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364l1.757 1.757"
              />
            </svg>
            dep
          </span>
        )}
      </div>

      {/* Description */}
      <p className="mb-2 text-xs text-gray-600 leading-relaxed">
        {truncatedDescription}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-1">
        <span
          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${categoryBadge.className}`}
        >
          {categoryBadge.label}
        </span>
        <span
          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${priorityBadge.className}`}
        >
          {priorityBadge.label}
        </span>
        <span
          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${effortBadge.className}`}
        >
          {effortBadge.label}
        </span>
      </div>
    </div>
  );
}
