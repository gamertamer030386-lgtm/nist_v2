"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import PhaseDropZone from "./PhaseDropZone";
import DraggableCard, { type RecommendationCardData } from "./DraggableCard";
import DependencyArrows from "./DependencyArrows";
import { updateRecommendationPhase } from "@/actions/recommendations";
import type { RoadmapPhase } from "@/lib/recommendations/prioritization";
import { useToast } from "@/components/Toast";

interface RoadmapTimelineProps {
  recommendations: RecommendationCardData[];
  assessmentId: string;
}

const PHASES: {
  id: RoadmapPhase;
  title: string;
  timeRange: string;
  accentColor: string;
}[] = [
  {
    id: "QUICK_WIN",
    title: "Quick Wins",
    timeRange: "0-3 months",
    accentColor: "bg-emerald-600",
  },
  {
    id: "SHORT_TERM",
    title: "Short-term",
    timeRange: "3-6 months",
    accentColor: "bg-blue-600",
  },
  {
    id: "MEDIUM_TERM",
    title: "Medium-term",
    timeRange: "6-12 months",
    accentColor: "bg-amber-600",
  },
  {
    id: "LONG_TERM",
    title: "Long-term",
    timeRange: "12+ months",
    accentColor: "bg-slate-600",
  },
];

export default function RoadmapTimeline({
  recommendations: initialRecommendations,
  assessmentId,
}: RoadmapTimelineProps) {
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group recommendations by phase
  const groupedByPhase: Record<RoadmapPhase, RecommendationCardData[]> = {
    QUICK_WIN: [],
    SHORT_TERM: [],
    MEDIUM_TERM: [],
    LONG_TERM: [],
  };

  for (const rec of recommendations) {
    const phase = rec.roadmapPhase as RoadmapPhase;
    if (groupedByPhase[phase]) {
      groupedByPhase[phase].push(rec);
    }
  }

  const activeRecommendation = activeId
    ? recommendations.find((r) => r.id === activeId)
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const recommendationId = active.id as string;
    const targetPhase = over.id as string;

    // Check if the target is a valid phase
    const validPhases: RoadmapPhase[] = [
      "QUICK_WIN",
      "SHORT_TERM",
      "MEDIUM_TERM",
      "LONG_TERM",
    ];

    // The over.id could be a phase ID or another card's ID
    // If it's a card, find which phase that card belongs to
    let newPhase: RoadmapPhase | null = null;

    if (validPhases.includes(targetPhase as RoadmapPhase)) {
      newPhase = targetPhase as RoadmapPhase;
    } else {
      // The drop target is another card - find its phase
      const targetCard = recommendations.find((r) => r.id === targetPhase);
      if (targetCard) {
        newPhase = targetCard.roadmapPhase as RoadmapPhase;
      }
    }

    if (!newPhase) return;

    // Find the current recommendation
    const currentRec = recommendations.find((r) => r.id === recommendationId);
    if (!currentRec || currentRec.roadmapPhase === newPhase) return;

    // Optimistic update
    setRecommendations((prev) =>
      prev.map((r) =>
        r.id === recommendationId ? { ...r, roadmapPhase: newPhase! } : r
      )
    );

    // Persist to server
    startTransition(async () => {
      try {
        await updateRecommendationPhase(recommendationId, newPhase!);
        showToast("Phase updated successfully", "success");
      } catch {
        // Revert on error
        setRecommendations((prev) =>
          prev.map((r) =>
            r.id === recommendationId
              ? { ...r, roadmapPhase: currentRec.roadmapPhase }
              : r
          )
        );
        showToast("Failed to update phase", "error");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        {PHASES.map((phase) => (
          <div
            key={phase.id}
            className="rounded-lg border border-gray-200 bg-white p-3 text-center"
          >
            <p className="text-2xl font-bold text-gray-900">
              {groupedByPhase[phase.id].length}
            </p>
            <p className="text-xs text-gray-500">{phase.title}</p>
          </div>
        ))}
      </div>

      {/* DnD Timeline */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PHASES.map((phase) => (
            <PhaseDropZone
              key={phase.id}
              phaseId={phase.id}
              title={phase.title}
              timeRange={phase.timeRange}
              recommendations={groupedByPhase[phase.id]}
              accentColor={phase.accentColor}
            />
          ))}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeRecommendation ? (
            <div className="rotate-2 scale-105">
              <DraggableCard recommendation={activeRecommendation} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Dependency indicators */}
      <DependencyArrows recommendations={recommendations} />

      {/* Loading indicator for pending server updates */}
      {isPending && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white shadow-lg">
          Saving…
        </div>
      )}
    </div>
  );
}
