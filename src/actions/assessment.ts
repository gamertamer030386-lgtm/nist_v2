"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreSchema } from "@/lib/validation";

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
 * Creates a new assessment for the authenticated user.
 */
export async function createAssessment(name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const assessment = await prisma.assessment.create({
    data: {
      name,
      userId: session.user.id,
      officeId: session.user.officeId ?? undefined,
    },
  });

  revalidatePath("/assessments");
  return assessment;
}

/**
 * Returns all assessments for the current user, ordered by creation date descending.
 */
export async function getAssessments() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const assessments = await prisma.assessment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return assessments;
}

/**
 * Returns a single assessment with all its scores, after verifying ownership.
 */
export async function getAssessmentDetail(assessmentId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await assertOwnership(assessmentId, session.user.id);

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      scores: {
        include: {
          subcategory: true,
        },
      },
    },
  });

  return assessment;
}

/**
 * Deletes an assessment after verifying ownership.
 */
export async function deleteAssessment(assessmentId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await assertOwnership(assessmentId, session.user.id);

  await prisma.assessment.delete({
    where: { id: assessmentId },
  });

  revalidatePath("/assessments");
}

/**
 * Updates or creates a subcategory score for a given assessment.
 * Validates input with Zod scoreSchema and verifies assessment ownership.
 */
export async function updateScore(
  assessmentId: string,
  subcategoryId: string,
  data: { currentScore?: number | null; targetScore?: number | null; comment?: string | null }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await assertOwnership(assessmentId, session.user.id);

  const parsed = scoreSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid score data");
  }

  const { currentScore, targetScore, comment } = parsed.data;

  const score = await prisma.subcategoryScore.upsert({
    where: {
      assessmentId_subcategoryId: {
        assessmentId,
        subcategoryId,
      },
    },
    update: {
      currentScore: currentScore ?? null,
      targetScore: targetScore ?? null,
      comment: comment ?? null,
    },
    create: {
      assessmentId,
      subcategoryId,
      currentScore: currentScore ?? null,
      targetScore: targetScore ?? null,
      comment: comment ?? null,
    },
  });

  revalidatePath(`/assessments/${assessmentId}`);
  revalidatePath(`/assessments/${assessmentId}/dashboard`);

  return score;
}
