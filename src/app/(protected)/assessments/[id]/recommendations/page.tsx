import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getRecommendations } from "@/actions/recommendations";
import { prisma } from "@/lib/prisma";
import GenerateRecommendationsButton from "@/components/recommendations/GenerateRecommendationsButton";
import AssessmentNav from "@/components/navigation/AssessmentNav";
import type { ControlCategory, PriorityLevel, EffortLevel } from "@prisma/client";

interface RecommendationsPageProps {
  params: Promise<{ id: string }>;
}

const CATEGORY_CONFIG: Record<
  ControlCategory,
  { label: string; icon: string }
> = {
  PEOPLE: { label: "People", icon: "👥" },
  TOOLS: { label: "Tools", icon: "🔧" },
  PROCESS: { label: "Process", icon: "📋" },
  PARTNERS: { label: "Partners", icon: "🤝" },
};

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  CRITICAL: "bg-red-100 text-red-800",
  HIGH: "bg-orange-100 text-orange-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-green-100 text-green-800",
};

const EFFORT_LABELS: Record<EffortLevel, string> = {
  LOW: "Low Effort",
  MEDIUM: "Medium Effort",
  HIGH: "High Effort",
};

export default async function RecommendationsPage({
  params,
}: RecommendationsPageProps) {
  const { id } = await params;
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

  const recommendations = await getRecommendations(id);

  // Group recommendations by category
  const grouped = recommendations.reduce(
    (acc, rec) => {
      if (!acc[rec.category]) {
        acc[rec.category] = [];
      }
      acc[rec.category].push(rec);
      return acc;
    },
    {} as Record<ControlCategory, typeof recommendations>
  );

  // Order categories consistently
  const categoryOrder: ControlCategory[] = [
    "PEOPLE",
    "TOOLS",
    "PROCESS",
    "PARTNERS",
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/assessments"
          className="text-sm text-indigo-600 hover:text-indigo-900"
        >
          ← Back to Assessments
        </Link>
      </div>

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {assessment.name} — Recommendations
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Control improvement recommendations based on gap analysis
        </p>
      </div>

      <AssessmentNav assessmentId={id} />

      <div className="mb-8 flex items-center justify-end">
        <GenerateRecommendationsButton assessmentId={id} />
      </div>

      {/* Empty state */}
      {recommendations.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
            />
          </svg>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            No recommendations yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Click &quot;Generate Recommendations&quot; to analyze gaps and create
            prioritized improvement recommendations.
          </p>
        </div>
      ) : (
        /* Recommendations grouped by category */
        <div className="space-y-8">
          {categoryOrder.map((category) => {
            const items = grouped[category];
            if (!items || items.length === 0) return null;

            const config = CATEGORY_CONFIG[category];

            return (
              <section key={category} aria-labelledby={`category-${category}`}>
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-xl" aria-hidden="true">
                    {config.icon}
                  </span>
                  <h2
                    id={`category-${category}`}
                    className="text-lg font-semibold text-gray-900"
                  >
                    {config.label}
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {items.map((rec) => (
                    <div
                      key={rec.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            {/* Subcategory ID badge */}
                            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                              {rec.subcategoryId}
                            </span>

                            {/* Priority level badge */}
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${PRIORITY_COLORS[rec.priorityLevel]}`}
                            >
                              {rec.priorityLevel}
                            </span>

                            {/* Effort level */}
                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                              {EFFORT_LABELS[rec.effortLevel]}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-700">
                            {rec.description}
                          </p>
                        </div>

                        {/* Gap size indicator */}
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs text-gray-500">Gap</p>
                          <p className="text-lg font-bold text-gray-900">
                            {rec.priorityScore.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
