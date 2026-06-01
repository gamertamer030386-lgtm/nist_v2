// src/lib/scoring.ts

/** Fixed target maturity level — all controls target Level 5 (Optimizing) */
export const FIXED_TARGET_SCORE = 5;

export interface ScoreRollup {
  currentScore: number | null;
  targetScore: number;
  gap: number | null;
}

/**
 * Calculate the average of an array of scores, ignoring null values.
 * Returns null if no valid scores exist.
 */
export function calculateAverage(scores: (number | null)[]): number | null {
  const valid = scores.filter((s): s is number => s !== null);
  if (valid.length === 0) return null;
  return valid.reduce((sum, s) => sum + s, 0) / valid.length;
}

/**
 * Calculate gap between current score and fixed target of 5.
 * Returns null if current score is null.
 */
export function calculateGap(
  currentScore: number | null,
  targetScore: number | null = FIXED_TARGET_SCORE
): number | null {
  if (currentScore === null) return null;
  const target = targetScore ?? FIXED_TARGET_SCORE;
  return target - currentScore;
}

/**
 * Calculate category-level rollup from subcategory scores.
 * Target is always fixed at 5.
 */
export function calculateCategoryRollup(
  subcategoryScores: { currentScore: number | null; targetScore?: number | null }[]
): ScoreRollup {
  const current = calculateAverage(subcategoryScores.map((s) => s.currentScore));
  return {
    currentScore: current,
    targetScore: FIXED_TARGET_SCORE,
    gap: calculateGap(current, FIXED_TARGET_SCORE),
  };
}

/**
 * Calculate function-level rollup from category rollups.
 */
export function calculateFunctionRollup(
  categoryRollups: ScoreRollup[]
): ScoreRollup {
  const current = calculateAverage(categoryRollups.map((c) => c.currentScore));
  return {
    currentScore: current,
    targetScore: FIXED_TARGET_SCORE,
    gap: calculateGap(current, FIXED_TARGET_SCORE),
  };
}

/**
 * Calculate overall rollup from function rollups.
 */
export function calculateOverallRollup(
  functionRollups: ScoreRollup[]
): ScoreRollup {
  const current = calculateAverage(functionRollups.map((f) => f.currentScore));
  return {
    currentScore: current,
    targetScore: FIXED_TARGET_SCORE,
    gap: calculateGap(current, FIXED_TARGET_SCORE),
  };
}

/**
 * Calculate progress percentage.
 */
export function calculateProgress(
  scores: { currentScore: number | null; targetScore?: number | null }[],
  totalSubcategories: number = 106
): number {
  const scored = scores.filter(
    (s) => s.currentScore !== null
  ).length;
  return (scored / totalSubcategories) * 100;
}

/**
 * Map gap value to color indicator.
 */
export function getGapColor(gap: number | null): string {
  if (gap === null) return "gray";
  if (gap === 0) return "green";
  if (gap === 1) return "yellow";
  if (gap === 2) return "orange";
  return "red"; // gap >= 3
}
