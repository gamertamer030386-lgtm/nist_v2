"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRecommendationsForGaps } from "@/lib/recommendations/engine";
import type { RoadmapPhase } from "@/lib/recommendations/prioritization";

/**
 * Verifies that the current user owns the specified assessment.
 * Throws "Unauthorized" if the assessment doesn't exist or belongs to another user.
 */
async function assertOwnership(assessmentId: string, userId: string) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { userId: true },
  });
  if (!assessment || assessment.userId !== userId) {
    throw new Error("Unauthorized");
  }
}

/**
 * Generates recommendations for an assessment based on gap analysis.
 * Deletes existing recommendations and creates new ones in a transaction.
 */
export async function generateRecommendations(assessmentId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await assertOwnership(assessmentId, session.user.id);

  // Fetch all SubcategoryScore records that have been scored (currentScore not null)
  // Target is always fixed at 5 — gap = 5 - currentScore
  const scores = await prisma.subcategoryScore.findMany({
    where: {
      assessmentId,
      currentScore: { not: null },
    },
    include: {
      subcategory: {
        include: {
          category: {
            select: { functionId: true },
          },
        },
      },
    },
  });

  // Filter to only scores where gap > 0 (currentScore < 5)
  const gapScores = scores.filter(
    (s) => s.currentScore! < 5
  );

  // Build gap inputs for the recommendation engine (target fixed at 5)
  const gapInputs = gapScores.map((s) => ({
    subcategoryId: s.subcategoryId,
    subcategoryName: s.subcategory.name,
    subcategoryDescription: s.subcategory.description,
    functionId: s.subcategory.category.functionId,
    gap: 5 - s.currentScore!,
    implementationExamples: s.subcategory.implementationExamples,
  }));

  // Generate recommendations using the engine
  const generated = generateRecommendationsForGaps(gapInputs);

  // Delete existing recommendations first
  await prisma.controlRecommendation.deleteMany({
    where: { assessmentId },
  });

  // Batch create all new recommendations (no transaction needed — single operation)
  if (generated.length > 0) {
    await prisma.controlRecommendation.createMany({
      data: generated.map((rec) => ({
        assessmentId,
        subcategoryId: rec.subcategoryId,
        category: rec.category,
        description: rec.description,
        priorityScore: rec.priorityScore,
        priorityLevel: rec.priorityLevel,
        effortLevel: rec.effortLevel,
        roadmapPhase: rec.roadmapPhase,
      })),
    });
  }

  revalidatePath(`/assessments/${assessmentId}`);
  revalidatePath(`/assessments/${assessmentId}/recommendations`);
  revalidatePath(`/assessments/${assessmentId}/roadmap`);

  // Return ordered by priorityScore descending
  return recommendations.sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Updates the roadmap phase of a recommendation.
 * Verifies that the recommendation's assessment belongs to the current user.
 */
export async function updateRecommendationPhase(
  recommendationId: string,
  phase: RoadmapPhase
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Fetch the recommendation to verify ownership through its assessment
  const recommendation = await prisma.controlRecommendation.findUnique({
    where: { id: recommendationId },
    select: { assessmentId: true },
  });

  if (!recommendation) {
    throw new Error("Recommendation not found");
  }

  await assertOwnership(recommendation.assessmentId, session.user.id);

  const updated = await prisma.controlRecommendation.update({
    where: { id: recommendationId },
    data: { roadmapPhase: phase },
  });

  revalidatePath(`/assessments/${recommendation.assessmentId}/roadmap`);

  return updated;
}

/**
 * Returns all recommendations for an assessment ordered by priorityScore descending.
 * Includes subcategory relation.
 */
export async function getRecommendations(assessmentId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await assertOwnership(assessmentId, session.user.id);

  const recommendations = await prisma.controlRecommendation.findMany({
    where: { assessmentId },
    include: { subcategory: true },
    orderBy: { priorityScore: "desc" },
  });

  return recommendations;
}
