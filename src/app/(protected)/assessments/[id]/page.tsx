import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateCategoryRollup,
  calculateFunctionRollup,
  calculateOverallRollup,
} from "@/lib/scoring";
import DashboardRadarChart from "@/components/dashboard/DashboardRadarChart";
import SubcategoryHeatmapGrid from "@/components/dashboard/SubcategoryHeatmapGrid";

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
            select: { id: true, name: true, description: true },
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

  const overallScore = overallRollup.currentScore;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Dashboard Content - 2 Column Layout */}
      <div className="flex-1 flex p-4 gap-4 overflow-hidden">
        {/* Left Column: Score + Radar stacked */}
        <div className="w-[280px] flex-shrink-0 flex flex-col gap-4">
          {/* Overall Maturity Score */}
          <div className="rounded-xl border border-purple-200 bg-white p-4 shadow-sm flex flex-col items-center">
            <p className="text-xs font-medium text-gray-500 mb-3">Overall Maturity</p>
            <div className="w-24 h-24 rounded-full border-8 border-purple-200 flex items-center justify-center bg-purple-50">
              <span className="text-2xl font-bold text-purple-700">
                {overallScore !== null ? overallScore.toFixed(1) : "—"}
              </span>
            </div>
            <p className="mt-2 text-[10px] text-gray-400">Target: 5.0</p>
            <div className="mt-2 w-full h-2 rounded-full bg-purple-100">
              <div className="h-2 rounded-full bg-purple-600 transition-all" style={{ width: `${overallScore !== null ? (overallScore / 5) * 100 : 0}%` }} />
            </div>
            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4 w-full">
              <Link href={`/assessments/${id}/score/GV`} className="flex flex-col items-center rounded-lg border border-purple-200 p-2 hover:bg-purple-50 transition-colors">
                <svg className="w-4 h-4 text-purple-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                <span className="text-[8px] font-semibold text-purple-700 mt-0.5">Assess</span>
              </Link>
              <Link href={`/assessments/${id}/recommendations`} className="flex flex-col items-center rounded-lg border border-purple-200 p-2 hover:bg-purple-50 transition-colors">
                <svg className="w-4 h-4 text-purple-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
                <span className="text-[8px] font-semibold text-purple-700 mt-0.5">Recommend</span>
              </Link>
              <Link href={`/assessments/${id}/heatmap`} className="flex flex-col items-center rounded-lg border border-purple-200 p-2 hover:bg-purple-50 transition-colors">
                <svg className="w-4 h-4 text-purple-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" /></svg>
                <span className="text-[8px] font-semibold text-purple-700 mt-0.5">Heatmap</span>
              </Link>
              <Link href={`/assessments/${id}/roadmap`} className="flex flex-col items-center rounded-lg border border-purple-200 p-2 hover:bg-purple-50 transition-colors">
                <svg className="w-4 h-4 text-purple-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                <span className="text-[8px] font-semibold text-purple-700 mt-0.5">Roadmap</span>
              </Link>
            </div>
          </div>

          {/* Function Radar */}
          <div className="flex-1 min-h-0 rounded-xl border border-purple-200 bg-white p-3 shadow-sm flex flex-col">
            <p className="text-xs font-medium text-gray-500 mb-1 flex-shrink-0">Function Radar</p>
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
        </div>

        {/* Right: Subcategory Heatmap filling remaining space */}
        <div className="flex-1 rounded-xl border border-purple-200 bg-white p-3 shadow-sm flex flex-col overflow-hidden">
          <SubcategoryHeatmapGrid
            items={functions.flatMap((fn) =>
              fn.categories.flatMap((cat) =>
                cat.subcategories.map((sub) => {
                  const score = scoreMap.get(sub.id);
                  const current = score?.currentScore ?? null;
                  return {
                    id: sub.id,
                    currentScore: current,
                    gap: current !== null ? 5 - current : null,
                    description: sub.description,
                    categoryName: cat.name,
                    functionName: fn.name,
                  };
                })
              )
            )}
            overallScore={overallScore}
          />
        </div>
      </div>
    </div>
  );
}
