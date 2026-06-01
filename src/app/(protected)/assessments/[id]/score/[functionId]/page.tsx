import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FunctionNav from "@/components/scoring/FunctionNav";
import CategoryAccordion from "@/components/scoring/CategoryAccordion";

interface ScoringPageProps {
  params: Promise<{ id: string; functionId: string }>;
}

export default async function ScoringPage({ params }: ScoringPageProps) {
  const { id, functionId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Verify assessment ownership
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    select: { id: true, name: true, userId: true },
  });

  if (!assessment || assessment.userId !== session.user.id) {
    redirect("/assessments");
  }

  // Fetch all functions for navigation
  const functions = await prisma.nistFunction.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  // Verify the functionId is valid
  const currentFunction = await prisma.nistFunction.findUnique({
    where: { id: functionId },
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

  if (!currentFunction) {
    redirect(`/assessments/${id}`);
  }

  // Fetch scores for subcategories in this function
  const subcategoryIds = currentFunction.categories.flatMap((cat) =>
    cat.subcategories.map((sub) => sub.id)
  );

  const scores = await prisma.subcategoryScore.findMany({
    where: {
      assessmentId: id,
      subcategoryId: { in: subcategoryIds },
    },
    select: {
      subcategoryId: true,
      currentScore: true,
      targetScore: true,
      comment: true,
    },
  });

  const totalSubcategories = subcategoryIds.length;
  const scoredCount = scores.filter(
    (s) => s.currentScore !== null || s.targetScore !== null
  ).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/assessments" className="hover:text-indigo-600">
          Assessments
        </Link>
        <span>/</span>
        <Link
          href={`/assessments/${id}`}
          className="hover:text-indigo-600"
        >
          {assessment.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">
          {currentFunction.id} - {currentFunction.name}
        </span>
      </div>

      {/* Function header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {currentFunction.id}: {currentFunction.name}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {currentFunction.description}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {scoredCount}/{totalSubcategories} subcategories scored
        </p>
      </div>

      {/* Function navigation */}
      <div className="mb-8">
        <FunctionNav
          assessmentId={id}
          activeId={functionId}
          functions={functions}
        />
      </div>

      {/* Category accordion */}
      <CategoryAccordion
        categories={currentFunction.categories}
        scores={scores}
        assessmentId={id}
        functionId={functionId}
      />
    </div>
  );
}
