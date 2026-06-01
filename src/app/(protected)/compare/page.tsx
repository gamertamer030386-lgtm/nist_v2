import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AssessmentSelector from "@/components/comparison/AssessmentSelector";

export default async function ComparePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch all assessments for the current user
  const assessments = await prisma.assessment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });

  // Serialize dates for client component
  const serializedAssessments = assessments.map((a) => ({
    id: a.id,
    name: a.name,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Compare Assessments
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Select two or more assessments to compare their function-level maturity
        scores side by side.
      </p>

      <div className="mt-6">
        <AssessmentSelector assessments={serializedAssessments} />
      </div>
    </div>
  );
}
