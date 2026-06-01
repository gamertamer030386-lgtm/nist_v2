import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateProgress } from "@/lib/scoring";
import AssessmentTopNav from "@/components/navigation/AssessmentTopNav";

export default async function AssessmentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      userId: true,
      scores: {
        select: { currentScore: true },
      },
    },
  });

  if (!assessment || assessment.userId !== session.user.id) {
    redirect("/assessments");
  }

  const scoredCount = assessment.scores.filter((s) => s.currentScore !== null).length;
  const progress = calculateProgress(assessment.scores);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AssessmentTopNav
        assessmentId={id}
        assessmentName={assessment.name}
        scoredCount={scoredCount}
        progress={progress}
      />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
