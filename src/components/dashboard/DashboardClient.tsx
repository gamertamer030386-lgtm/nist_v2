"use client";

import { useState } from "react";
import { FunctionSummaryTable } from "./FunctionSummaryTable";
import { CategoryDetailTable } from "./CategoryDetailTable";
import { FunctionBarChart } from "./FunctionBarChart";
import type { FunctionRollupData } from "./FunctionSummaryTable";

interface DashboardClientProps {
  functionRollups: FunctionRollupData[];
}

export function DashboardClient({ functionRollups }: DashboardClientProps) {
  const [selectedFunctionId, setSelectedFunctionId] = useState<string | null>(null);

  const selectedFunction = selectedFunctionId
    ? functionRollups.find((fn) => fn.functionId === selectedFunctionId) ?? null
    : null;

  return (
    <>
      {/* Function Summary Table with selection */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Function Summary
        </h2>
        <FunctionSummaryTable
          data={functionRollups}
          selectedFunctionId={selectedFunctionId}
          onFunctionSelect={setSelectedFunctionId}
        />
      </div>

      {/* Category Detail Area — filtered when a function is selected */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedFunction
              ? `Category Detail — ${selectedFunction.functionName}`
              : "Category Detail"}
          </h2>
          {selectedFunction && (
            <button
              onClick={() => setSelectedFunctionId(null)}
              className="text-sm text-indigo-600 hover:text-indigo-900 transition-colors"
            >
              Show all functions
            </button>
          )}
        </div>
        <CategoryDetailTable
          data={selectedFunction ? [selectedFunction] : functionRollups}
        />
      </div>

      {/* Function Bar Charts — show selected or all */}
      {(selectedFunction ? [selectedFunction] : functionRollups).map((fn) => (
        <div
          key={fn.functionId}
          className={`rounded-lg border bg-white p-6 shadow-sm transition-all ${
            selectedFunctionId === fn.functionId
              ? "border-indigo-300 ring-2 ring-indigo-100 lg:col-span-2"
              : "border-gray-200"
          }`}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            <span className="mr-2 inline-flex items-center rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700">
              {fn.functionId}
            </span>
            {fn.functionName}
          </h2>
          <FunctionBarChart
            functionName={fn.functionName}
            categories={fn.categories}
          />
        </div>
      ))}
    </>
  );
}
