"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AssessmentNavProps {
  assessmentId: string;
}

const navItems = [
  { href: "", label: "Scoring" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/heatmap", label: "Heatmap" },
  { href: "/roadmap", label: "Roadmap" },
];

export default function AssessmentNav({ assessmentId }: AssessmentNavProps) {
  const pathname = usePathname();
  const basePath = `/assessments/${assessmentId}`;

  return (
    <nav className="mb-6 border-b border-gray-200" aria-label="Assessment navigation">
      <div className="-mb-px flex space-x-6 overflow-x-auto">
        {navItems.map((item) => {
          const fullHref = `${basePath}${item.href}`;
          // Active if exact match for root, or starts with for sub-pages
          const isActive =
            item.href === ""
              ? pathname === basePath ||
                pathname.startsWith(`${basePath}/score`)
              : pathname === fullHref ||
                pathname.startsWith(fullHref + "/");

          return (
            <Link
              key={item.label}
              href={fullHref}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
