import type { FunctionRollupData } from "./FunctionSummaryTable";

interface CategoryDetailTableProps {
  data: FunctionRollupData[];
}

export function CategoryDetailTable({ data }: CategoryDetailTableProps) {
  return (
    <div className="space-y-6">
      {data.map((fn) => (
        <div key={fn.functionId}>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            <span className="mr-1 inline-flex items-center rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700">
              {fn.functionId}
            </span>
            {fn.functionName}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 pr-4 text-xs font-medium text-gray-500">Category</th>
                  <th className="pb-2 pr-4 text-center text-xs font-medium text-gray-500">Current</th>
                  <th className="pb-2 pr-4 text-center text-xs font-medium text-gray-500">Target</th>
                  <th className="pb-2 text-center text-xs font-medium text-gray-500">Gap</th>
                </tr>
              </thead>
              <tbody>
                {fn.categories.map((cat) => (
                  <tr key={cat.categoryId} className="border-b border-gray-50">
                    <td className="py-2 pr-4 text-gray-600">
                      <span className="mr-1 text-xs text-gray-400">{cat.categoryId}</span>
                      {cat.categoryName}
                    </td>
                    <td className="py-2 pr-4 text-center text-gray-600">
                      {cat.rollup.currentScore !== null
                        ? cat.rollup.currentScore.toFixed(2)
                        : "—"}
                    </td>
                    <td className="py-2 pr-4 text-center text-gray-600">
                      {cat.rollup.targetScore !== null
                        ? cat.rollup.targetScore.toFixed(2)
                        : "—"}
                    </td>
                    <td className="py-2 text-center">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getGapBadgeClasses(cat.rollup.gap)}`}>
                        {cat.rollup.gap !== null ? cat.rollup.gap.toFixed(2) : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
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
