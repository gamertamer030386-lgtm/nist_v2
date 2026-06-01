// src/lib/recommendations/prioritization.ts

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type EffortLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type RoadmapPhase = 'QUICK_WIN' | 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';

/**
 * Criticality weights for each NIST CSF 2.0 function.
 * Higher values indicate more critical functions that should be prioritized.
 */
export const FUNCTION_CRITICALITY_WEIGHTS: Record<string, number> = {
  GV: 1.0,
  ID: 0.9,
  PR: 0.9,
  DE: 0.8,
  RS: 0.8,
  RC: 0.7,
};

/**
 * Calculate the priority score for a recommendation.
 *
 * Formula: (gap * 0.5) + (criticality * 0.3) + (risk_reduction / effort * 0.2)
 *
 * @param gap - The maturity gap (target - current), typically 1-4
 * @param criticality - Function criticality weight (0-1)
 * @param riskReduction - Estimated risk reduction factor (1-5)
 * @param effort - Numeric effort level (1=LOW, 2=MEDIUM, 3=HIGH)
 * @returns Priority score (higher = more urgent)
 */
export function calculatePriorityScore(
  gap: number,
  criticality: number,
  riskReduction: number,
  effort: number
): number {
  const gapComponent = gap * 0.5;
  const criticalityComponent = criticality * 0.3;
  const efficiencyComponent = (riskReduction / effort) * 0.2;

  return Math.round((gapComponent + criticalityComponent + efficiencyComponent) * 100) / 100;
}

/**
 * Map a numeric priority score to a priority level.
 *
 * - CRITICAL: score >= 4.0
 * - HIGH: score >= 3.0
 * - MEDIUM: score >= 2.0
 * - LOW: score < 2.0
 */
export function mapScoreToPriorityLevel(score: number): PriorityLevel {
  if (score >= 4.0) return 'CRITICAL';
  if (score >= 3.0) return 'HIGH';
  if (score >= 2.0) return 'MEDIUM';
  return 'LOW';
}

/**
 * Assign a roadmap phase based on priority level and effort level.
 *
 * Matrix:
 * | Priority \ Effort | LOW        | MEDIUM      | HIGH        |
 * |-------------------|------------|-------------|-------------|
 * | CRITICAL          | QUICK_WIN  | SHORT_TERM  | SHORT_TERM  |
 * | HIGH              | QUICK_WIN  | SHORT_TERM  | MEDIUM_TERM |
 * | MEDIUM            | SHORT_TERM | MEDIUM_TERM | LONG_TERM   |
 * | LOW               | SHORT_TERM | LONG_TERM   | LONG_TERM   |
 */
export function assignRoadmapPhase(
  priorityLevel: PriorityLevel,
  effortLevel: EffortLevel
): RoadmapPhase {
  const phaseMatrix: Record<PriorityLevel, Record<EffortLevel, RoadmapPhase>> = {
    CRITICAL: {
      LOW: 'QUICK_WIN',
      MEDIUM: 'SHORT_TERM',
      HIGH: 'SHORT_TERM',
    },
    HIGH: {
      LOW: 'QUICK_WIN',
      MEDIUM: 'SHORT_TERM',
      HIGH: 'MEDIUM_TERM',
    },
    MEDIUM: {
      LOW: 'SHORT_TERM',
      MEDIUM: 'MEDIUM_TERM',
      HIGH: 'LONG_TERM',
    },
    LOW: {
      LOW: 'SHORT_TERM',
      MEDIUM: 'LONG_TERM',
      HIGH: 'LONG_TERM',
    },
  };

  return phaseMatrix[priorityLevel][effortLevel];
}
