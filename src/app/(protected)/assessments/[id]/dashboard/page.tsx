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
import {
  OverallScoreCard,
  FunctionRadarChart,
  DashboardClient,
  type FunctionRollupData,
  type CategoryRollupData,
} from "@/components/dashboard";
import ExportMenu from "@/components/export/ExportMenu";
import AssessmentNav from "@/components/navigation/AssessmentNav";

interface DashboardPageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch assessment with ownership check
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    select: { id: true, name: true, userId: true, createdAt: true },
  });

  if (!assessment || assessment.userId !== session.user.id) {
    redirect("/assessments");
  }

  // Fetch all SubcategoryScore records for this assessment in a single query
  const scores = await prisma.subcategoryScore.findMany({
    where: { assessmentId: id },
    select: {
      currentScore: true,
      targetScore: true,
      subcategoryId: true,
      subcategory: {
        select: {
          id: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
              functionId: true,
              function: {
                select: {
                  id: true,
                  name: true,
                  sortOrder: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Fetch all functions for complete structure (even those without scores)
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

  // Build a map of subcategoryId -> score for quick lookup
  const scoreMap = new Map(
    scores.map((s) => [s.subcategoryId, { currentScore: s.currentScore, targetScore: s.targetScore }])
  );

  // Compute rollups: category -> function -> overall
  const functionRollups: FunctionRollupData[] = functions.map((fn) => {
    const categoryRollups: CategoryRollupData[] = fn.categories.map((cat) => {
      const subcategoryScores = cat.subcategories.map((sub) => {
        const score = scoreMap.get(sub.id);
        return {
          currentScore: score?.currentScore ?? null,
          targetScore: score?.targetScore ?? null,
        };
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
      categories: categoryRollups,
    };
  });

  const overallRollup = calculateOverallRollup(
    functionRollups.map((f) => f.rollup)
  );

  const progress = calculateProgress(
    scores.map((s) => ({ currentScore: s.currentScore, targetScore: s.targetScore }))
  );

  const scoredCount = scores.filter(
    (s) => s.currentScore !== null || s.targetScore !== null
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/assessments"
            className="text-sm text-indigo-600 hover:text-indigo-900"
          >
            ← Back to Assessments
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            {assessment.name} — Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Created {new Date(assessment.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <ExportMenu assessmentId={id} />
          <div className="text-right">
            <p className="text-sm text-gray-500">Progress</p>
            <p className="text-2xl font-bold text-indigo-600">
              {progress.toFixed(0)}%
            </p>
            <p className="text-xs text-gray-400">{scoredCount} / 106 scored</p>
          </div>
        </div>
      </div>

      <AssessmentNav assessmentId={id} />

      {/* Dashboard Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Overall Score Card */}
        <OverallScoreCard rollup={overallRollup} />

        {/* Radar Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Function Radar
          </h2>
          <FunctionRadarChart
            data={functionRollups.map((fn) => ({
              functionName: fn.functionName,
              current: fn.rollup.currentScore ?? 0,
              target: fn.rollup.targetScore ?? 0,
            }))}
          />
        </div>

        {/* Function Summary Table, Category Detail, and Bar Charts — interactive client component */}
        <DashboardClient functionRollups={functionRollups} />
      </div>
    </div>
  );
}


