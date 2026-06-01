"use client";

import type { ComparisonResponse } from "@/app/api/assessments/compare/route";

interface ComparisonTableProps {
  data: ComparisonResponse;
}

export default function ComparisonTable({ data }: ComparisonTableProps) {
  const { assessments } = data;

  if (assessments.length === 0) return null;

  // Determine earliest and latest assessments for the "Change" column
  const earliest = assessments[0]; // sorted ascending by createdAt from API
  const latest = assessments[assessments.length - 1];
  const showChange = assessments.length >= 2;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Function
            </th>
            {assessments.map((a) => (
              <th
                key={a.id}
                scope="col"
                className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                <div>{a.name}</div>
                <div className="font-normal normal-case">
                  {new Date(a.createdAt).toLocaleDateString()}
                </div>
              </th>
            ))}
            {showChange && (
              <th
                scope="col"
                className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Change
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {assessments[0].functions.map((fn, fnIdx) => {
            const earliestScore = earliest.functions[fnIdx]?.rollup.currentScore;
            const latestScore = latest.functions[fnIdx]?.rollup.currentScore;

            let change: number | null = null;
            if (
              showChange &&
              latestScore !== null &&
              latestScore !== undefined &&
              earliestScore !== null &&
              earliestScore !== undefined
            ) {
              change = latestScore - earliestScore;
            }

            return (
              <tr key={fn.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                  {fn.name}
                </td>
                {assessments.map((a) => {
                  const funcData = a.functions[fnIdx];
                  return (
                    <td
                      key={a.id}
                      className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-700"
                    >
                      {funcData?.rollup.currentScore !== null &&
                      funcData?.rollup.currentScore !== undefined
                        ? funcData.rollup.currentScore.toFixed(2)
                        : "—"}
                    </td>
                  );
                })}
                {showChange && (
                  <td className="whitespace-nowrap px-4 py-3 text-center text-sm font-medium">
                    {change !== null ? (
                      <span className={getChangeColor(change)}>
                        {change > 0 ? "+" : ""}
                        {change.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function getChangeColor(change: number): string {
  if (change > 0) return "text-green-600";
  if (change < 0) return "text-red-600";
  return "text-gray-500";
}
