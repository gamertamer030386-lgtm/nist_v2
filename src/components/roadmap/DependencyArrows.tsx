"use client";

import type { RecommendationCardData } from "./DraggableCard";

interface DependencyArrowsProps {
  recommendations: RecommendationCardData[];
}

/**
 * Displays dependency indicators for recommendations that have dependencies.
 * For MVP, this renders a summary list of dependency relationships rather than
 * full SVG arrows between cards (which would require complex DOM position tracking).
 */
export default function DependencyArrows({
  recommendations,
}: DependencyArrowsProps) {
  // Find recommendations that have dependencies
  const withDependencies = recommendations.filter((r) => r.dependsOnId);

  if (withDependencies.length === 0) return null;

  // Build a lookup for subcategory IDs
  const idToSubcategory = new Map(
    recommendations.map((r) => [r.id, r.subcategoryId])
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h4 className="mb-2 text-sm font-semibold text-gray-700">
        Dependencies
      </h4>
      <div className="space-y-1">
        {withDependencies.map((rec) => {
          const dependsOnSubcategory = idToSubcategory.get(rec.dependsOnId!);
          return (
            <div
              key={rec.id}
              className="flex items-center gap-2 text-xs text-gray-600"
            >
              <span className="font-medium text-indigo-700">
                {rec.subcategoryId}
              </span>
              <svg
                className="h-3 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 16 12"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M1 6h12m0 0-4-4m4 4-4 4"
                />
              </svg>
              <span className="text-gray-500">depends on</span>
              <span className="font-medium text-indigo-700">
                {dependsOnSubcategory ?? "unknown"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
