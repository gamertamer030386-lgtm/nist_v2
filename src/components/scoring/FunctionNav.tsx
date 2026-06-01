"use client";

import Link from "next/link";

interface FunctionNavProps {
  assessmentId: string;
  activeId: string;
  functions: { id: string; name: string }[];
}

export default function FunctionNav({
  assessmentId,
  activeId,
  functions,
}: FunctionNavProps) {
  return (
    <nav aria-label="NIST CSF Functions" className="flex flex-wrap gap-2">
      {functions.map((fn) => {
        const isActive = fn.id === activeId;
        return (
          <Link
            key={fn.id}
            href={`/assessments/${assessmentId}/score/${fn.id}`}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {fn.id}
            <span className="ml-1 hidden sm:inline text-xs font-normal opacity-75">
              {fn.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
