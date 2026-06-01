import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AssessmentScoringLayout from "@/components/scoring/AssessmentScoringLayout";

interface ScoringPageProps {
  params: Promise<{ id: string; functionId: string }>;
}

export default async function ScoringPage({ params }: ScoringPageProps) {
  const { id, functionId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    select: { id: true, name: true, userId: true },
  });

  if (!assessment || assessment.userId !== session.user.id) {
    redirect("/assessments");
  }

  // Fetch all functions with categories and subcategories
  const functions = await prisma.nistFunction.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: {
          subcategories: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              name: true,
              description: true,
              implementationExamples: true,
              informativeReferences: true,
            },
          },
        },
      },
    },
  });

  // Fetch all scores for this assessment
  const scores = await prisma.subcategoryScore.findMany({
    where: { assessmentId: id },
    select: {
      subcategoryId: true,
      currentScore: true,
      targetScore: true,
      comment: true,
    },
  });

  // Fetch users for "Assigned To" dropdown
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, email: true, name: true },
    orderBy: { email: "asc" },
    take: 20,
  });

  return (
    <AssessmentScoringLayout
      assessmentId={id}
      assessmentName={assessment.name}
      functions={functions}
      scores={scores}
      activeFunctionId={functionId}
      users={users}
    />
  );
}
