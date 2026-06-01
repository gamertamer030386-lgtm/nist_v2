import type { ScoreRollup } from "@/lib/scoring";

export interface FunctionRollupData {
  functionId: string;
  functionName: string;
  rollup: ScoreRollup;
  categories: CategoryRollupData[];
}

export interface CategoryRollupData {
  categoryId: string;
  categoryName: string;
  rollup: ScoreRollup;
}

interface FunctionSummaryTableProps {
  data: FunctionRollupData[];
  selectedFunctionId?: string | null;
  onFunctionSelect?: (functionId: string | null) => void;
}

export function FunctionSummaryTable({
  data,
  selectedFunctionId,
  onFunctionSelect,
}: FunctionSummaryTableProps) {
  const isInteractive = !!onFunctionSelect;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="pb-3 pr-4 font-medium text-gray-700">Function</th>
            <th className="pb-3 pr-4 text-center font-medium text-gray-700">Current</th>
            <th className="pb-3 pr-4 text-center font-medium text-gray-700">Target</th>
            <th className="pb-3 text-center font-medium text-gray-700">Gap</th>
          </tr>
        </thead>
        <tbody>
          {data.map((fn) => {
            const isSelected = selectedFunctionId === fn.functionId;
            return (
              <tr
                key={fn.functionId}
                className={`border-b border-gray-100 transition-colors ${
                  isInteractive ? "cursor-pointer hover:bg-indigo-50/50" : ""
                } ${isSelected ? "bg-indigo-50" : ""}`}
                onClick={() => {
                  if (onFunctionSelect) {
                    onFunctionSelect(isSelected ? null : fn.functionId);
                  }
                }}
                role={isInteractive ? "button" : undefined}
                tabIndex={isInteractive ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isInteractive && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onFunctionSelect!(isSelected ? null : fn.functionId);
                  }
                }}
                aria-pressed={isInteractive ? isSelected : undefined}
              >
                <td className="py-3 pr-4">
                  <span className="mr-2 inline-flex items-center rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700">
                    {fn.functionId}
                  </span>
                  {fn.functionName}
                  {isInteractive && (
                    <span className="ml-2 text-xs text-gray-400">
                      {isSelected ? "▼" : "▶"}
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4 text-center">
                  {fn.rollup.currentScore !== null
                    ? fn.rollup.currentScore.toFixed(2)
                    : "—"}
                </td>
                <td className="py-3 pr-4 text-center">
                  {fn.rollup.targetScore !== null
                    ? fn.rollup.targetScore.toFixed(2)
                    : "—"}
                </td>
                <td className="py-3 text-center">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getGapBadgeClasses(fn.rollup.gap)}`}>
                    {fn.rollup.gap !== null ? fn.rollup.gap.toFixed(2) : "—"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {isInteractive && (
        <p className="mt-2 text-xs text-gray-400">
          Click a function row to drill into its category detail
        </p>
      )}
    </div>
  );
}

/** Returns Tailwind badge classes based on gap value */
function getGapBadgeClasses(gap: number | null): string {
  if (gap === null) return "bg-gray-100 text-gray-600";
  if (gap === 0) return "bg-green-100 text-green-700";
  if (gap <= 1) return "bg-yellow-100 text-yellow-700";
  if (gap <= 2) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
}
