import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getRecommendations } from "@/actions/recommendations";
import { prisma } from "@/lib/prisma";
import RoadmapTimeline from "@/components/roadmap/RoadmapTimeline";
import ExportRoadmapButton from "@/components/roadmap/ExportRoadmapButton";
import AssessmentNav from "@/components/navigation/AssessmentNav";
import type { RecommendationCardData } from "@/components/roadmap/DraggableCard";

interface RoadmapPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoadmapPage({ params }: RoadmapPageProps) {
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

  // Map to card data format
  const cardData: RecommendationCardData[] = recommendations.map((rec) => ({
    id: rec.id,
    subcategoryId: rec.subcategoryId,
    description: rec.description,
    category: rec.category,
    priorityLevel: rec.priorityLevel,
    effortLevel: rec.effortLevel,
    priorityScore: rec.priorityScore,
    roadmapPhase: rec.roadmapPhase,
    dependsOnId: rec.dependsOnId,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
          {assessment.name} — Roadmap
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Drag recommendations between phases to adjust your implementation
          timeline
        </p>
      </div>

      <AssessmentNav assessmentId={id} />

      <div className="mb-8 flex items-center justify-end">
        <ExportRoadmapButton assessmentId={id} />
      </div>

      {/* Empty state */}
      {cardData.length === 0 ? (
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
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            No recommendations to display
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Generate recommendations from the{" "}
            <Link
              href={`/assessments/${id}/recommendations`}
              className="text-indigo-600 hover:text-indigo-900 underline"
            >
              Recommendations page
            </Link>{" "}
            first to populate the roadmap.
          </p>
        </div>
      ) : (
        <RoadmapTimeline recommendations={cardData} assessmentId={id} />
      )}
    </div>
  );
}
