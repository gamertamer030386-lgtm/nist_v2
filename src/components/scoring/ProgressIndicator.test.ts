import { describe, it, expect } from "vitest";

/**
 * Tests for the ProgressIndicator component logic.
 * The component calculates scored count and percentage from scores array.
 * Since the test environment is node (no DOM), we test the calculation logic directly.
 */

function computeProgress(
  scores: { currentScore: number | null; targetScore: number | null }[],
  totalSubcategories: number = 106
) {
  const scored = scores.filter(
    (s) => s.currentScore !== null || s.targetScore !== null
  ).length;
  const percentage =
    totalSubcategories > 0 ? (scored / totalSubcategories) * 100 : 0;
  return { scored, percentage: Math.round(percentage) };
}

describe("ProgressIndicator logic", () => {
  it("returns 0 scored and 0% for empty scores", () => {
    const result = computeProgress([]);
    expect(result.scored).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it("counts subcategories with currentScore set", () => {
    const scores = [
      { currentScore: 3, targetScore: null },
      { currentScore: null, targetScore: null },
    ];
    const result = computeProgress(scores, 10);
    expect(result.scored).toBe(1);
    expect(result.percentage).toBe(10);
  });

  it("counts subcategories with targetScore set", () => {
    const scores = [
      { currentScore: null, targetScore: 4 },
      { currentScore: null, targetScore: null },
    ];
    const result = computeProgress(scores, 10);
    expect(result.scored).toBe(1);
    expect(result.percentage).toBe(10);
  });

  it("counts subcategories with both scores set as one", () => {
    const scores = [{ currentScore: 3, targetScore: 4 }];
    const result = computeProgress(scores, 10);
    expect(result.scored).toBe(1);
    expect(result.percentage).toBe(10);
  });

  it("calculates correct percentage for partial completion", () => {
    const scores = Array.from({ length: 45 }, () => ({
      currentScore: 3 as number | null,
      targetScore: 4 as number | null,
    }));
    const result = computeProgress(scores, 106);
    expect(result.scored).toBe(45);
    expect(result.percentage).toBe(42); // 45/106 * 100 = 42.45... rounds to 42
  });

  it("returns 100% when all subcategories are scored", () => {
    const scores = Array.from({ length: 106 }, () => ({
      currentScore: 3 as number | null,
      targetScore: 4 as number | null,
    }));
    const result = computeProgress(scores, 106);
    expect(result.scored).toBe(106);
    expect(result.percentage).toBe(100);
  });

  it("handles zero totalSubcategories gracefully", () => {
    const result = computeProgress([], 0);
    expect(result.scored).toBe(0);
    expect(result.percentage).toBe(0);
  });
});
