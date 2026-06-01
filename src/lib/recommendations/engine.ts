// src/lib/recommendations/engine.ts

import {
  RECOMMENDATION_TEMPLATES,
  FUNCTION_NAMES,
  type ControlCategory,
  type RecommendationTemplate,
} from "./templates";
import {
  calculatePriorityScore,
  mapScoreToPriorityLevel,
  assignRoadmapPhase,
  FUNCTION_CRITICALITY_WEIGHTS,
} from "./prioritization";

export type EffortLevel = "LOW" | "MEDIUM" | "HIGH";
export type PriorityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type RoadmapPhase = "QUICK_WIN" | "SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM";

export interface GapInput {
  subcategoryId: string;
  subcategoryName?: string;
  subcategoryDescription?: string;
  functionId: string;
  gap: number;
  implementationExamples?: string;
}

export interface GeneratedRecommendation {
  subcategoryId: string;
  category: ControlCategory;
  description: string;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  effortLevel: EffortLevel;
  roadmapPhase: RoadmapPhase;
}

/**
 * Find ALL matching templates for a given subcategory ID.
 * Returns multiple recommendations per subcategory covering different dimensions
 * (People, Tools, Process, Partners).
 */
function findAllMatchingTemplates(subcategoryId: string, functionId: string): RecommendationTemplate[] {
  // Match all templates where the subcategory starts with the pattern
  const matches = RECOMMENDATION_TEMPLATES.filter(
    (t) => subcategoryId.startsWith(t.pattern) && t.functionId === functionId
  );

  if (matches.length > 0) return matches;

  // Fallback: match by pattern prefix only (ignore functionId)
  const fallback = RECOMMENDATION_TEMPLATES.filter((t) => subcategoryId.startsWith(t.pattern));
  return fallback;
}

/**
 * Generate recommendations for ALL subcategories with gaps > 0.
 * Each subcategory gets multiple recommendations (People, Tools, Process, Partners).
 * Gap-based filtering:
 * - Gap 1-2: Only the most critical recommendation per subcategory
 * - Gap 3: Top 2 recommendations per subcategory
 * - Gap 4: All matching recommendations per subcategory
 *
 * Results are sorted from HIGHEST priority to LOWEST.
 */
export function generateRecommendationsForGaps(
  gaps: GapInput[]
): GeneratedRecommendation[] {
  const recommendations: GeneratedRecommendation[] = [];

  for (const gap of gaps) {
    if (gap.gap <= 0) continue;

    const templates = findAllMatchingTemplates(gap.subcategoryId, gap.functionId);
    if (templates.length === 0) continue;

    const functionName = FUNCTION_NAMES[gap.functionId] || gap.functionId;
    const criticality = FUNCTION_CRITICALITY_WEIGHTS[gap.functionId] ?? 0.5;

    // Determine how many recommendations based on gap size
    let maxRecs: number;
    if (gap.gap >= 4) {
      maxRecs = templates.length; // All recommendations for critical gaps
    } else if (gap.gap >= 3) {
      maxRecs = Math.min(3, templates.length); // Top 3 for large gaps
    } else if (gap.gap >= 2) {
      maxRecs = Math.min(2, templates.length); // Top 2 for medium gaps
    } else {
      maxRecs = 1; // Only the most impactful for small gaps
    }

    // Score and sort templates by risk reduction (highest first)
    const scoredTemplates = templates
      .map((template) => {
        const effortNumeric = effortToNumeric(template.effortLevel);
        const priorityScore = calculatePriorityScore(
          gap.gap,
          criticality,
          template.riskReduction,
          effortNumeric
        );
        return { template, priorityScore };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);

    // Take top N recommendations based on gap size
    const selectedTemplates = scoredTemplates.slice(0, maxRecs);

    for (const { template, priorityScore } of selectedTemplates) {
      const priorityLevel = mapScoreToPriorityLevel(priorityScore);
      const roadmapPhase = assignRoadmapPhase(priorityLevel, template.effortLevel);

      recommendations.push({
        subcategoryId: gap.subcategoryId,
        category: template.category,
        description: template.description,
        priorityScore,
        priorityLevel,
        effortLevel: template.effortLevel,
        roadmapPhase,
      });
    }
  }

  // Sort ALL recommendations from HIGHEST priority to LOWEST
  return recommendations.sort((a, b) => {
    // Primary: priority score descending
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    // Secondary: gap size (find from original inputs)
    const gapA = gaps.find((g) => g.subcategoryId === a.subcategoryId)?.gap ?? 0;
    const gapB = gaps.find((g) => g.subcategoryId === b.subcategoryId)?.gap ?? 0;
    return gapB - gapA;
  });
}

function effortToNumeric(effort: EffortLevel): number {
  switch (effort) {
    case "LOW": return 1;
    case "MEDIUM": return 2;
    case "HIGH": return 3;
  }
}
