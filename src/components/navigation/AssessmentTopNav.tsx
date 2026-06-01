"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AssessmentTopNavProps {
  assessmentId: string;
  assessmentName: string;
  scoredCount: number;
  totalCount?: number;
  progress: number;
}

const NAV_ITEMS = [
  { href: "", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/score/GV", label: "Assessment", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
  { href: "/recommendations", label: "Recommend", icon: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" },
  { href: "/heatmap", label: "Heatmap", icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" },
  { href: "/roadmap", label: "Roadmap", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" },
];

export default function AssessmentTopNav({
  assessmentId,
  assessmentName,
  scoredCount,
  totalCount = 106,
  progress,
}: AssessmentTopNavProps) {
  const pathname = usePathname();
  const basePath = `/assessments/${assessmentId}`;

  return (
    <div className="flex-shrink-0 px-4 py-2 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-purple-900">{assessmentName}</h1>
          <p className="text-[10px] text-gray-500">
            {scoredCount}/{totalCount} scored • {progress.toFixed(0)}% complete
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {NAV_ITEMS.map((item) => {
            const fullHref = `${basePath}${item.href}`;
            const isActive = item.href === ""
              ? pathname === basePath
              : pathname.startsWith(fullHref);

            return (
              <Link
                key={item.label}
                href={fullHref}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-purple-700 text-white shadow-sm"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
