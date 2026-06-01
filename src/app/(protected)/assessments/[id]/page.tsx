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
      {/* Top Bar */}
      <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <Link
              href="/assessments"
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              ← Back to Assessments
            </Link>
            <h1 className="mt-1 text-xl font-bold text-gray-900">
              {assessment.name}
            </h1>
            <p className="text-xs text-gray-500">
              Created {new Date(assessment.createdAt).toLocaleDateString()} • {scoredCount}/106 scored • {progress.toFixed(0)}% complete
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Content - No Scroll */}
      <div className="flex-1 flex flex-col justify-center px-6 py-6 max-w-7xl mx-auto w-full">
        {/* Top Row: Score + Radar + Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Overall Maturity Score */}
          <div className="rounded-xl border border-purple-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-gray-500 mb-2">Overall Maturity Score</p>
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-purple-200 flex items-center justify-center bg-purple-50">
                <span className="text-4xl font-bold text-purple-700">
                  {overallScore !== null ? overallScore.toFixed(1) : "—"}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">Target: 5.0</p>
            <div className="mt-2 w-full">
              <div className="h-2 w-full rounded-full bg-purple-100">
                <div
                  className="h-2 rounded-full bg-purple-600 transition-all"
                  style={{ width: `${overallScore !== null ? (overallScore / 5) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Function Radar Chart */}
          <div className="rounded-xl border border-purple-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-gray-500 mb-2">Function Radar</p>
            <DashboardRadarChart
              data={functionRollups.map((fn) => ({
                name: fn.functionId,
                current: fn.rollup.currentScore ?? 0,
                target: 5,
              }))}
            />
          </div>

          {/* Function Heatmap Placeholder */}
          <div className="rounded-xl border border-purple-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-gray-500 mb-4">Function Heatmap</p>
            <div className="grid grid-cols-3 gap-2 w-full max-w-[200px]">
              {functionRollups.map((fn) => {
                const score = fn.rollup.currentScore;
                let bgColor = "bg-gray-100";
                if (score !== null) {
                  if (score >= 4) bgColor = "bg-green-400";
                  else if (score >= 3) bgColor = "bg-yellow-400";
                  else if (score >= 2) bgColor = "bg-orange-400";
                  else bgColor = "bg-red-400";
                }
                return (
                  <div
                    key={fn.functionId}
                    className={`${bgColor} rounded-lg p-3 flex flex-col items-center justify-center`}
                  >
                    <span className="text-xs font-bold text-white drop-shadow-sm">{fn.functionId}</span>
                    <span className="text-[10px] text-white/80">{score?.toFixed(1) ?? "—"}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[10px] text-gray-400">Color scale: Red (1) → Green (5)</p>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href={`/assessments/${id}/score/GV`}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-purple-200 bg-white p-6 shadow-sm hover:border-purple-400 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
              <svg className="w-6 h-6 text-purple-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-purple-700">Start Assessment</span>
            <span className="text-xs text-gray-500 mt-1">Score controls</span>
          </Link>

          <Link
            href={`/assessments/${id}/recommendations`}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-purple-200 bg-white p-6 shadow-sm hover:border-purple-400 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
              <svg className="w-6 h-6 text-purple-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-purple-700">Recommendations</span>
            <span className="text-xs text-gray-500 mt-1">AI-powered insights</span>
          </Link>

          <Link
            href={`/assessments/${id}/heatmap`}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-purple-200 bg-white p-6 shadow-sm hover:border-purple-400 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
              <svg className="w-6 h-6 text-purple-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-purple-700">Heatmap</span>
            <span className="text-xs text-gray-500 mt-1">Visual overview</span>
          </Link>

          <Link
            href={`/assessments/${id}/roadmap`}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-purple-200 bg-white p-6 shadow-sm hover:border-purple-400 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
              <svg className="w-6 h-6 text-purple-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-purple-700">Roadmap</span>
            <span className="text-xs text-gray-500 mt-1">Implementation plan</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
