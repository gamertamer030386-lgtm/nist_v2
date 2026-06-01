"use client";

import { useState } from "react";
import type { ComparisonResponse } from "@/app/api/assessments/compare/route";
import ComparisonBarChart from "./ComparisonBarChart";
import ComparisonTable from "./ComparisonTable";

interface Assessment {
  id: string;
  name: string;
  createdAt: string;
}

interface AssessmentSelectorProps {
  assessments: Assessment[];
}

export default function AssessmentSelector({
  assessments,
}: AssessmentSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [comparisonData, setComparisonData] =
    useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleToggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    // Clear previous comparison when selection changes
    setComparisonData(null);
    setError(null);
  }

  async function handleCompare() {
    if (selectedIds.size < 2) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/assessments/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentIds: Array.from(selectedIds) }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch comparison data");
      }

      const data: ComparisonResponse = await res.json();
      setComparisonData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Assessment selection */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Select Assessments to Compare
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose 2 or more assessments to compare their function-level scores.
        </p>

        {assessments.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            No assessments available. Create assessments first.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {assessments.map((assessment) => (
              <label
                key={assessment.id}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 p-3 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(assessment.id)}
                  onChange={() => handleToggle(assessment.id)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    {assessment.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({new Date(assessment.createdAt).toLocaleDateString()})
                  </span>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={handleCompare}
            disabled={selectedIds.size < 2 || loading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Compare Selected"}
          </button>
          {selectedIds.size < 2 && selectedIds.size > 0 && (
            <span className="ml-3 text-xs text-gray-500">
              Select at least one more assessment
            </span>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Comparison results */}
      {comparisonData && (
        <div className="space-y-6">
          {/* Bar chart visualization */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Function Score Comparison
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Side-by-side comparison of function-level scores across assessments.
            </p>
            <div className="mt-4">
              <ComparisonBarChart data={comparisonData} />
            </div>
          </div>

          {/* Comparison table with change column */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Score Details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Function-level scores with change between earliest and latest assessment.
            </p>
            <div className="mt-4">
              <ComparisonTable data={comparisonData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
