"use client";

import { useState } from "react";
import { getHeatmapColor, type HeatmapCell } from "@/lib/heatmap";

interface HeatmapGridProps {
  cells: HeatmapCell[];
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  cell: HeatmapCell | null;
}

const CELL_SIZE = 40;
const CELL_GAP = 3;
const LABEL_WIDTH = 180;
const HEADER_HEIGHT = 30;
const FUNCTION_HEADER_HEIGHT = 28;

export function HeatmapGrid({ cells }: HeatmapGridProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    cell: null,
  });

  // Group cells by function
  const functionGroups = groupByFunction(cells);

  // Calculate SVG dimensions
  const maxCategoriesInFunction = Math.max(
    ...functionGroups.map((g) => g.categories.length),
    1
  );
  // We render one column per category within each function row
  // Actually, let's render as a grid: rows = categories (grouped by function), columns = score metrics
  // Better approach: rows = functions, each function has sub-rows for categories

  // Total rows = sum of categories across all functions + function headers
  let totalRows = 0;
  for (const group of functionGroups) {
    totalRows += 1; // function header
    totalRows += group.categories.length;
  }

  const svgWidth = LABEL_WIDTH + CELL_SIZE + CELL_GAP + CELL_SIZE + CELL_GAP + CELL_SIZE + 20;
  const svgHeight = HEADER_HEIGHT + totalRows * (CELL_SIZE + CELL_GAP) + 20;

  // Column headers
  const columns = ["Current", "Target", "Gap"];

  let currentY = HEADER_HEIGHT;

  const handleMouseEnter = (
    e: React.MouseEvent<SVGRectElement>,
    cell: HeatmapCell
  ) => {
    const svgRect = (e.target as SVGRectElement).closest("svg")?.getBoundingClientRect();
    if (svgRect) {
      setTooltip({
        visible: true,
        x: e.clientX - svgRect.left + 10,
        y: e.clientY - svgRect.top - 10,
        cell,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, cell: null });
  };

  return (
    <div className="relative overflow-x-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        className="min-w-full"
        role="img"
        aria-label="Heatmap grid showing gap severity across NIST CSF functions and categories"
      >
        {/* Column headers */}
        {columns.map((col, i) => (
          <text
            key={col}
            x={LABEL_WIDTH + i * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2}
            y={HEADER_HEIGHT - 10}
            textAnchor="middle"
            className="fill-gray-600 text-xs font-medium"
            fontSize={11}
          >
            {col}
          </text>
        ))}

        {/* Render function groups */}
        {functionGroups.map((group) => {
          const functionY = currentY;
          currentY += FUNCTION_HEADER_HEIGHT;

          const categoryElements = group.categories.map((cell) => {
            const rowY = currentY;
            currentY += CELL_SIZE + CELL_GAP;

            const currentColor = getScoreColor(cell.currentScore);
            const targetColor = getScoreColor(cell.targetScore);
            const gapColor = getHeatmapColor(cell.gap);

            return (
              <g key={cell.categoryId}>
                {/* Category label */}
                <text
                  x={10}
                  y={rowY + CELL_SIZE / 2 + 4}
                  className="fill-gray-700 text-xs"
                  fontSize={11}
                >
                  {truncateLabel(cell.categoryName, 24)}
                </text>

                {/* Current score cell */}
                <rect
                  x={LABEL_WIDTH}
                  y={rowY}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={4}
                  fill={currentColor}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onMouseEnter={(e) => handleMouseEnter(e, cell)}
                  onMouseLeave={handleMouseLeave}
                />
                <text
                  x={LABEL_WIDTH + CELL_SIZE / 2}
                  y={rowY + CELL_SIZE / 2 + 4}
                  textAnchor="middle"
                  className="pointer-events-none fill-white text-xs font-medium"
                  fontSize={11}
                >
                  {cell.currentScore !== null ? cell.currentScore.toFixed(1) : "—"}
                </text>

                {/* Target score cell */}
                <rect
                  x={LABEL_WIDTH + CELL_SIZE + CELL_GAP}
                  y={rowY}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={4}
                  fill={targetColor}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onMouseEnter={(e) => handleMouseEnter(e, cell)}
                  onMouseLeave={handleMouseLeave}
                />
                <text
                  x={LABEL_WIDTH + CELL_SIZE + CELL_GAP + CELL_SIZE / 2}
                  y={rowY + CELL_SIZE / 2 + 4}
                  textAnchor="middle"
                  className="pointer-events-none fill-white text-xs font-medium"
                  fontSize={11}
                >
                  {cell.targetScore !== null ? cell.targetScore.toFixed(1) : "—"}
                </text>

                {/* Gap cell (color-coded by severity) */}
                <rect
                  x={LABEL_WIDTH + 2 * (CELL_SIZE + CELL_GAP)}
                  y={rowY}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={4}
                  fill={gapColor}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onMouseEnter={(e) => handleMouseEnter(e, cell)}
                  onMouseLeave={handleMouseLeave}
                />
                <text
                  x={LABEL_WIDTH + 2 * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2}
                  y={rowY + CELL_SIZE / 2 + 4}
                  textAnchor="middle"
                  className="pointer-events-none fill-white text-xs font-medium"
                  fontSize={11}
                >
                  {cell.gap !== null ? cell.gap.toFixed(1) : "—"}
                </text>
              </g>
            );
          });

          return (
            <g key={group.functionId}>
              {/* Function header */}
              <rect
                x={0}
                y={functionY}
                width={svgWidth}
                height={FUNCTION_HEADER_HEIGHT}
                fill="#f3f4f6"
                rx={4}
              />
              <text
                x={10}
                y={functionY + FUNCTION_HEADER_HEIGHT / 2 + 4}
                className="fill-gray-900 text-sm font-semibold"
                fontSize={12}
                fontWeight="bold"
              >
                {group.functionName}
              </text>
              {categoryElements}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip.visible && tooltip.cell && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="text-sm font-semibold text-gray-900">
            {tooltip.cell.categoryName}
          </p>
          <p className="text-xs text-gray-600">
            Function: {tooltip.cell.functionName}
          </p>
          <div className="mt-1 space-y-0.5">
            <p className="text-xs text-gray-700">
              Current Score:{" "}
              <span className="font-medium">
                {tooltip.cell.currentScore !== null
                  ? tooltip.cell.currentScore.toFixed(2)
                  : "Not scored"}
              </span>
            </p>
            <p className="text-xs text-gray-700">
              Target Score:{" "}
              <span className="font-medium">
                {tooltip.cell.targetScore !== null
                  ? tooltip.cell.targetScore.toFixed(2)
                  : "Not scored"}
              </span>
            </p>
            <p className="text-xs text-gray-700">
              Gap:{" "}
              <span className="font-medium">
                {tooltip.cell.gap !== null
                  ? tooltip.cell.gap.toFixed(2)
                  : "N/A"}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: group cells by function
function groupByFunction(cells: HeatmapCell[]) {
  const map = new Map<
    string,
    { functionId: string; functionName: string; categories: HeatmapCell[] }
  >();

  for (const cell of cells) {
    if (!map.has(cell.functionId)) {
      map.set(cell.functionId, {
        functionId: cell.functionId,
        functionName: cell.functionName,
        categories: [],
      });
    }
    map.get(cell.functionId)!.categories.push(cell);
  }

  return Array.from(map.values());
}

// Helper: get a color for a score value (blue scale)
function getScoreColor(score: number | null): string {
  if (score === null) return "#9ca3af"; // gray
  if (score <= 1) return "#93c5fd"; // light blue
  if (score <= 2) return "#60a5fa"; // blue
  if (score <= 3) return "#3b82f6"; // medium blue
  if (score <= 4) return "#2563eb"; // dark blue
  return "#1d4ed8"; // very dark blue
}

// Helper: truncate long labels
function truncateLabel(label: string, maxLength: number): string {
  if (label.length <= maxLength) return label;
  return label.slice(0, maxLength - 1) + "…";
}
