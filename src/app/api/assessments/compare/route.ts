import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateCategoryRollup,
  calculateFunctionRollup,
  ScoreRollup,
} from "@/lib/scoring";

export interface ComparisonAssessment {
  id: string;
  name: string;
  createdAt: string;
  functions: {
    id: string;
    name: string;
    rollup: ScoreRollup;
  }[];
}

export interface ComparisonResponse {
  assessments: ComparisonAssessment[];
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { assessmentIds: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { assessmentIds } = body;

  if (!Array.isArray(assessmentIds) || assessmentIds.length < 2) {
    return NextResponse.json(
      { error: "At least 2 assessment IDs are required" },
      { status: 400 }
    );
  }

  // Verify all assessments belong to the current user
  const assessments = await prisma.assessment.findMany({
    where: {
      id: { in: assessmentIds },
      userId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });

  if (assessments.length !== assessmentIds.length) {
    return NextResponse.json(
      { error: "One or more assessments not found or not owned by you" },
      { status: 403 }
    );
  }

  // Fetch all NIST functions with their categories and subcategories
  const nistFunctions = await prisma.nistFunction.findMany({
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

  // Fetch all scores for the requested assessments
  const scores = await prisma.subcategoryScore.findMany({
    where: {
      assessmentId: { in: assessmentIds },
    },
    select: {
      assessmentId: true,
      subcategoryId: true,
      currentScore: true,
      targetScore: true,
    },
  });

  // Group scores by assessment
  const scoresByAssessment = new Map<
    string,
    Map<string, { currentScore: number | null; targetScore: number | null }>
  >();

  for (const score of scores) {
    if (!scoresByAssessment.has(score.assessmentId)) {
      scoresByAssessment.set(score.assessmentId, new Map());
    }
    scoresByAssessment.get(score.assessmentId)!.set(score.subcategoryId, {
      currentScore: score.currentScore,
      targetScore: score.targetScore,
    });
  }

  // Compute function-level rollups for each assessment
  const comparisonAssessments: ComparisonAssessment[] = assessments.map(
    (assessment) => {
      const assessmentScores = scoresByAssessment.get(assessment.id) ?? new Map();

      const functions = nistFunctions.map((fn) => {
        const categoryRollups: ScoreRollup[] = fn.categories.map((cat) => {
          const subcategoryScores = cat.subcategories.map((sub) => {
            const score = assessmentScores.get(sub.id);
            return {
              currentScore: score?.currentScore ?? null,
              targetScore: score?.targetScore ?? null,
            };
          });
          return calculateCategoryRollup(subcategoryScores);
        });

        const functionRollup = calculateFunctionRollup(categoryRollups);

        return {
          id: fn.id,
          name: fn.name,
          rollup: functionRollup,
        };
      });

      return {
        id: assessment.id,
        name: assessment.name,
        createdAt: assessment.createdAt.toISOString(),
        functions,
      };
    }
  );

  // Sort by creation date ascending so earlier assessments come first
  comparisonAssessments.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return NextResponse.json({ assessments: comparisonAssessments });
}
