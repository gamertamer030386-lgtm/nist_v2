// src/lib/heatmap.ts

import type { FunctionRollupData } from "@/components/dashboard/FunctionSummaryTable";

export interface HeatmapCell {
  functionId: string;
  functionName: string;
  categoryId: string;
  categoryName: string;
  currentScore: number | null;
  targetScore: number | null;
  gap: number | null;
}

/**
 * Map a gap value to a hex color for heatmap rendering.
 * - null (not scored): gray
 * - 0: green (no gap)
 * - 1: yellow
 * - 2: orange
 * - 3+: red
 */
export function getHeatmapColor(gap: number | null): string {
  if (gap === null) return "#9ca3af"; // gray
  if (gap === 0) return "#22c55e"; // green
  if (gap === 1) return "#eab308"; // yellow
  if (gap === 2) return "#f97316"; // orange
  return "#ef4444"; // red (gap >= 3)
}

/**
 * Flatten function rollups into individual heatmap cells per category.
 * Each cell contains the category-level rollup scores and gap.
 */
export function computeHeatmapCells(
  functionRollups: FunctionRollupData[]
): HeatmapCell[] {
  const cells: HeatmapCell[] = [];

  for (const fn of functionRollups) {
    for (const cat of fn.categories) {
      cells.push({
        functionId: fn.functionId,
        functionName: fn.functionName,
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
        currentScore: cat.rollup.currentScore,
        targetScore: cat.rollup.targetScore,
        gap: cat.rollup.gap,
      });
    }
  }

  return cells;
}
