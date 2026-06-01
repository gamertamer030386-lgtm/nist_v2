import { describe, it, expect } from "vitest";
import {
  calculateAverage,
  calculateGap,
  calculateCategoryRollup,
  calculateFunctionRollup,
  calculateOverallRollup,
  calculateProgress,
  getGapColor,
} from "./scoring";

describe("calculateAverage", () => {
  it("returns null for empty array", () => {
    expect(calculateAverage([])).toBeNull();
  });

  it("returns null for all-null array", () => {
    expect(calculateAverage([null, null, null])).toBeNull();
  });

  it("calculates average ignoring nulls", () => {
    expect(calculateAverage([2, null, 4])).toBe(3);
  });

  it("calculates average of all valid scores", () => {
    expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
  });

  it("returns the single value for a one-element array", () => {
    expect(calculateAverage([4])).toBe(4);
  });
});

describe("calculateGap", () => {
  it("returns null if currentScore is null", () => {
    expect(calculateGap(null, 3)).toBeNull();
  });

  it("returns null if targetScore is null", () => {
    expect(calculateGap(3, null)).toBeNull();
  });

  it("returns null if both are null", () => {
    expect(calculateGap(null, null)).toBeNull();
  });

  it("returns target minus current", () => {
    expect(calculateGap(2, 5)).toBe(3);
  });

  it("returns 0 when scores are equal", () => {
    expect(calculateGap(3, 3)).toBe(0);
  });

  it("returns negative gap when current exceeds target", () => {
    expect(calculateGap(4, 2)).toBe(-2);
  });
});

describe("calculateCategoryRollup", () => {
  it("returns all nulls for empty input", () => {
    expect(calculateCategoryRollup([])).toEqual({
      currentScore: null,
      targetScore: null,
      gap: null,
    });
  });

  it("calculates rollup from subcategory scores", () => {
    const scores = [
      { currentScore: 2, targetScore: 4 },
      { currentScore: 4, targetScore: 4 },
    ];
    expect(calculateCategoryRollup(scores)).toEqual({
      currentScore: 3,
      targetScore: 4,
      gap: 1,
    });
  });

  it("handles mixed null values", () => {
    const scores = [
      { currentScore: null, targetScore: 4 },
      { currentScore: 2, targetScore: null },
    ];
    const result = calculateCategoryRollup(scores);
    expect(result.currentScore).toBe(2);
    expect(result.targetScore).toBe(4);
    expect(result.gap).toBe(2);
  });
});

describe("calculateFunctionRollup", () => {
  it("calculates rollup from category rollups", () => {
    const rollups = [
      { currentScore: 2, targetScore: 4, gap: 2 },
      { currentScore: 4, targetScore: 4, gap: 0 },
    ];
    expect(calculateFunctionRollup(rollups)).toEqual({
      currentScore: 3,
      targetScore: 4,
      gap: 1,
    });
  });

  it("ignores null category rollups", () => {
    const rollups = [
      { currentScore: null, targetScore: null, gap: null },
      { currentScore: 3, targetScore: 5, gap: 2 },
    ];
    expect(calculateFunctionRollup(rollups)).toEqual({
      currentScore: 3,
      targetScore: 5,
      gap: 2,
    });
  });
});

describe("calculateOverallRollup", () => {
  it("calculates rollup from function rollups", () => {
    const rollups = [
      { currentScore: 2, targetScore: 4, gap: 2 },
      { currentScore: 3, targetScore: 5, gap: 2 },
      { currentScore: 4, targetScore: 4, gap: 0 },
    ];
    expect(calculateOverallRollup(rollups)).toEqual({
      currentScore: 3,
      targetScore: expect.closeTo(4.333, 2),
      gap: expect.closeTo(1.333, 2),
    });
  });
});

describe("calculateProgress", () => {
  it("returns 0 when no scores exist", () => {
    expect(calculateProgress([])).toBe(0);
  });

  it("counts subcategories with any non-null score", () => {
    const scores = [
      { currentScore: 3, targetScore: null },
      { currentScore: null, targetScore: 4 },
      { currentScore: null, targetScore: null },
    ];
    // 2 out of 106 scored
    expect(calculateProgress(scores)).toBeCloseTo((2 / 106) * 100, 5);
  });

  it("uses custom total when provided", () => {
    const scores = [
      { currentScore: 3, targetScore: 4 },
      { currentScore: 2, targetScore: 5 },
    ];
    expect(calculateProgress(scores, 10)).toBe(20);
  });

  it("returns 100 when all subcategories are scored", () => {
    const scores = Array.from({ length: 106 }, () => ({
      currentScore: 3,
      targetScore: 4,
    }));
    expect(calculateProgress(scores)).toBe(100);
  });
});

describe("getGapColor", () => {
  it("returns gray for null gap", () => {
    expect(getGapColor(null)).toBe("gray");
  });

  it("returns green for gap of 0", () => {
    expect(getGapColor(0)).toBe("green");
  });

  it("returns yellow for gap of 1", () => {
    expect(getGapColor(1)).toBe("yellow");
  });

  it("returns orange for gap of 2", () => {
    expect(getGapColor(2)).toBe("orange");
  });

  it("returns red for gap of 3 or more", () => {
    expect(getGapColor(3)).toBe("red");
    expect(getGapColor(4)).toBe("red");
    expect(getGapColor(10)).toBe("red");
  });
});
