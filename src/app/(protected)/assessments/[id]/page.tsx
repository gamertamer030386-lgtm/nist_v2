import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateProgress } from "@/lib/scoring";
import AssessmentNav from "@/components/navigation/AssessmentNav";

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
          },
        },
      },
    },
  });

  const progress = calculateProgress(assessment.scores);
  const scoredCount = assessment.scores.filter(
    (s) => s.currentScore !== null || s.targetScore !== null
  ).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/assessments"
          className="text-sm text-indigo-600 hover:text-indigo-900"
        >
          ← Back to Assessments
        </Link>
      </div>

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{assessment.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Created {new Date(assessment.createdAt).toLocaleDateString()}
        </p>
      </div>

      <AssessmentNav assessmentId={id} />

      {/* Progress indicator */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-700">
              Scoring Progress
            </h2>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {scoredCount} / 106
            </p>
            <p className="text-sm text-gray-500">subcategories scored</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-indigo-600">
              {progress.toFixed(0)}%
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-indigo-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Function navigation */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Score by Function
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Select a function below to begin scoring its subcategories.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {functions.map((fn) => {
          const totalSubcategories = fn.categories.reduce(
            (sum, cat) => sum + cat.subcategories.length,
            0
          );
          const scoredInFunction = assessment.scores.filter((s) =>
            fn.categories.some((cat) =>
              cat.subcategories.some(
                (sub) =>
                  sub.id === s.subcategoryId &&
                  (s.currentScore !== null || s.targetScore !== null)
              )
            )
          ).length;

          return (
            <Link
              key={fn.id}
              href={`/assessments/${id}/score/${fn.id}`}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                  {fn.id}
                </span>
                <span className="text-xs text-gray-500">
                  {scoredInFunction}/{totalSubcategories}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">
                {fn.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                {fn.description}
              </p>
              <div className="mt-3">
                <div className="h-1.5 w-full rounded-full bg-gray-200">
                  <div
                    className="h-1.5 rounded-full bg-indigo-600 transition-all"
                    style={{
                      width: `${
                        totalSubcategories > 0
                          ? (scoredInFunction / totalSubcategories) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
