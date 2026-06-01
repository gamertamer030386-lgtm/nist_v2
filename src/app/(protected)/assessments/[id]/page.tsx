import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateCategoryRollup,
  calculateFunctionRollup,
  calculateOverallRollup,
  calculateProgress,
} from "@/lib/scoring";
import DashboardRadarChart from "@/components/dashboard/DashboardRadarChart";

interface AssessmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssessmentDetailPage({
  params,
}: AssessmentDetailPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      scores: true,
    },
  });

  if (!assessment || assessment.userId !== session.user.id) {
    redirect("/assessments");
  }

  const functions = await prisma.nistFunction.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: {
          subcategories: {
            orderBy: { sortOrder: "asc" },
            select: { id: true },
          },
        },
      },
    },
  });

  // Build score map
  const scoreMap = new Map(
    assessment.scores.map((s) => [
      s.subcategoryId,
      { currentScore: s.currentScore, targetScore: s.targetScore },
    ])
  );

  // Compute rollups
  const functionRollups = functions.map((fn) => {
    const categoryRollups = fn.categories.map((cat) => {
      const subcategoryScores = cat.subcategories.map((sub) => {
        const score = scoreMap.get(sub.id);
        return { currentScore: score?.currentScore ?? null };
      });
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        rollup: calculateCategoryRollup(subcategoryScores),
      };
    });

    return {
      functionId: fn.id,
      functionName: fn.name,
      rollup: calculateFunctionRollup(categoryRollups.map((c) => c.rollup)),
    };
  });

  const overallRollup = calculateOverallRollup(
    functionRollups.map((f) => f.rollup)
  );

  const progress = calculateProgress(assessment.scores);
  const scoredCount = assessment.scores.filter(
    (s) => s.currentScore !== null || s.targetScore !== null
  ).length;

  const overallScore = overallRollup.currentScore;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Top Bar with Navigation */}
      <div className="flex-shrink-0 px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-purple-900">
              {assessment.name}
            </h1>
            <p className="text-xs text-gray-500">
              {scoredCount}/106 scored • {progress.toFixed(0)}% complete
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/assessments/${id}`} className="rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-200 transition-colors">
              Dashboard
            </Link>
            <Link href={`/assessments/${id}/score/GV`} className="rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-200 transition-colors">
              Start Assessment
            </Link>
            <Link href={`/assessments/${id}/recommendations`} className="rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-200 transition-colors">
              Recommendations
            </Link>
            <Link href={`/assessments/${id}/heatmap`} className="rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-200 transition-colors">
              Heatmap
            </Link>
            <Link href={`/assessments/${id}/roadmap`} className="rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-200 transition-colors">
              Roadmap
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Content - No Scroll, Single Pane */}
      <div className="flex-1 flex p-4 gap-4 overflow-hidden">
        {/* Left Column: Score + Radar + Action Buttons */}
        <div className="w-[35%] flex flex-col gap-3">
          {/* Overall Maturity Score */}
          <div className="rounded-xl border border-purple-200 bg-white p-4 shadow-sm flex items-center gap-4 h-[120px]">
            <div className="w-20 h-20 rounded-full border-6 border-purple-200 flex items-center justify-center bg-purple-50 flex-shrink-0">
              <span className="text-2xl font-bold text-purple-700">
                {overallScore !== null ? overallScore.toFixed(1) : "—"}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500">Overall Maturity Score</p>
              <p className="text-[10px] text-gray-400 mt-1">Target: 5.0</p>
              <div className="mt-2 h-2 w-full rounded-full bg-purple-100">
                <div className="h-2 rounded-full bg-purple-600 transition-all" style={{ width: `${overallScore !== null ? (overallScore / 5) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          {/* Function Radar Chart */}
          <div className="rounded-xl border border-purple-200 bg-white p-3 shadow-sm flex-1 flex flex-col min-h-0">
            <p className="text-xs font-medium text-gray-500 mb-1">Function Radar</p>
            <div className="flex-1 min-h-0">
              <DashboardRadarChart
                data={functionRollups.map((fn) => ({
                  name: fn.functionId,
                  current: fn.rollup.currentScore ?? 0,
                  target: 5,
                }))}
              />
            </div>
          </div>

          {/* Action Buttons - 2x2 grid */}
          <div className="grid grid-cols-4 gap-2 h-[70px]">
            <Link href={`/assessments/${id}/score/GV`} className="flex flex-col items-center justify-center rounded-lg border border-purple-200 bg-white p-2 hover:border-purple-400 hover:shadow transition-all">
              <svg className="w-5 h-5 text-purple-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span className="text-[9px] font-semibold text-purple-700 mt-1">Assessment</span>
            </Link>
            <Link href={`/assessments/${id}/recommendations`} className="flex flex-col items-center justify-center rounded-lg border border-purple-200 bg-white p-2 hover:border-purple-400 hover:shadow transition-all">
              <svg className="w-5 h-5 text-purple-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              <span className="text-[9px] font-semibold text-purple-700 mt-1">Recommend</span>
            </Link>
            <Link href={`/assessments/${id}/heatmap`} className="flex flex-col items-center justify-center rounded-lg border border-purple-200 bg-white p-2 hover:border-purple-400 hover:shadow transition-all">
              <svg className="w-5 h-5 text-purple-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
              </svg>
              <span className="text-[9px] font-semibold text-purple-700 mt-1">Heatmap</span>
            </Link>
            <Link href={`/assessments/${id}/roadmap`} className="flex flex-col items-center justify-center rounded-lg border border-purple-200 bg-white p-2 hover:border-purple-400 hover:shadow transition-all">
              <svg className="w-5 h-5 text-purple-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span className="text-[9px] font-semibold text-purple-700 mt-1">Roadmap</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Heatmap (spans full height) */}
        <div className="w-[65%] rounded-xl border border-purple-200 bg-white p-4 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <p className="text-sm font-semibold text-gray-700">Subcategory Heatmap</p>
            <p className="text-xs text-gray-400">Overall: <span className="font-bold text-purple-700">{overallScore?.toFixed(1) ?? "—"}</span>/5</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-10 sm:grid-cols-12 lg:grid-cols-14 xl:grid-cols-16 gap-1">
              {functions.map((fn) =>
                fn.categories.flatMap((cat) =>
                  cat.subcategories.map((sub) => {
                    const score = scoreMap.get(sub.id);
                    const current = score?.currentScore ?? null;
                    const gap = current !== null ? 5 - current : null;
                    let bgColor = "bg-gray-200";
                    let textColor = "text-gray-500";
                    if (gap !== null) {
                      if (gap >= 3) { bgColor = "bg-red-500"; textColor = "text-white"; }
                      else if (gap >= 2) { bgColor = "bg-yellow-400"; textColor = "text-gray-900"; }
                      else if (gap >= 1) { bgColor = "bg-green-300"; textColor = "text-gray-900"; }
                      else { bgColor = "bg-green-500"; textColor = "text-white"; }
                    }
                    return (
                      <div
                        key={sub.id}
                        className={`${bgColor} ${textColor} rounded p-1 flex flex-col items-center justify-center text-center min-h-[32px]`}
                        title={`${sub.id} — Score: ${current ?? "N/A"} | Gap: ${gap ?? "N/A"}`}
                      >
                        <span className="text-[7px] font-bold leading-tight">{sub.id}</span>
                        <span className="text-[9px] font-semibold">{current ?? "—"}</span>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500" /><span className="text-[9px] text-gray-500">High (3+)</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-400" /><span className="text-[9px] text-gray-500">Medium (2)</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-400" /><span className="text-[9px] text-gray-500">Low (0-1)</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-200" /><span className="text-[9px] text-gray-500">Not Scored</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
