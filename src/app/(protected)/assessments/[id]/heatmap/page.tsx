import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCategoryRollup, calculateFunctionRollup } from "@/lib/scoring";
import { computeHeatmapCells } from "@/lib/heatmap";
import { HeatmapGrid } from "@/components/heatmap/HeatmapGrid";
import { HeatmapLegend } from "@/components/heatmap/HeatmapLegend";
import type { FunctionRollupData, CategoryRollupData } from "@/components/dashboard/FunctionSummaryTable";

interface HeatmapPageProps {
  params: Promise<{ id: string }>;
}

export default async function HeatmapPage({ params }: HeatmapPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch assessment with ownership check
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    select: { id: true, name: true, userId: true },
  });

  if (!assessment || assessment.userId !== session.user.id) {
    redirect("/assessments");
  }

  // Fetch all SubcategoryScore records for this assessment
  const scores = await prisma.subcategoryScore.findMany({
    where: { assessmentId: id },
    select: {
      currentScore: true,
      targetScore: true,
      subcategoryId: true,
    },
  });

  // Fetch all functions with categories and subcategories
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

  // Build score lookup map
  const scoreMap = new Map(
    scores.map((s) => [
      s.subcategoryId,
      { currentScore: s.currentScore, targetScore: s.targetScore },
    ])
  );

  // Compute rollups
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

  // Compute heatmap cells
  const heatmapCells = computeHeatmapCells(functionRollups);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          Visual overview of gap severity across all functions and categories
        </p>
      </div>

      {/* Legend */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          Gap Severity Legend
        </h2>
        <HeatmapLegend />
      </div>

      {/* Heatmap Grid */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <HeatmapGrid cells={heatmapCells} />
      </div>
    </div>
  );
}
