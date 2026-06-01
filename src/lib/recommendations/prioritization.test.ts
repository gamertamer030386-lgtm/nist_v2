import { describe, it, expect } from 'vitest';
import {
  calculatePriorityScore,
  mapScoreToPriorityLevel,
  assignRoadmapPhase,
  FUNCTION_CRITICALITY_WEIGHTS,
} from './prioritization';

describe('FUNCTION_CRITICALITY_WEIGHTS', () => {
  it('defines weights for all 6 NIST functions', () => {
    expect(FUNCTION_CRITICALITY_WEIGHTS).toEqual({
      GV: 1.0,
      ID: 0.9,
      PR: 0.9,
      DE: 0.8,
      RS: 0.8,
      RC: 0.7,
    });
  });

  it('has GV as the highest criticality', () => {
    const max = Math.max(...Object.values(FUNCTION_CRITICALITY_WEIGHTS));
    expect(FUNCTION_CRITICALITY_WEIGHTS['GV']).toBe(max);
  });

  it('has RC as the lowest criticality', () => {
    const min = Math.min(...Object.values(FUNCTION_CRITICALITY_WEIGHTS));
    expect(FUNCTION_CRITICALITY_WEIGHTS['RC']).toBe(min);
  });
});

describe('calculatePriorityScore', () => {
  it('applies the formula: (gap * 0.5) + (criticality * 0.3) + (risk_reduction / effort * 0.2)', () => {
    // gap=4, criticality=1.0, risk_reduction=5, effort=1
    // (4*0.5) + (1.0*0.3) + (5/1*0.2) = 2.0 + 0.3 + 1.0 = 3.3
    expect(calculatePriorityScore(4, 1.0, 5, 1)).toBe(3.3);
  });

  it('handles minimum gap of 1', () => {
    // gap=1, criticality=0.7, risk_reduction=3, effort=3
    // (1*0.5) + (0.7*0.3) + (3/3*0.2) = 0.5 + 0.21 + 0.2 = 0.91
    expect(calculatePriorityScore(1, 0.7, 3, 3)).toBe(0.91);
  });

  it('handles maximum gap of 4', () => {
    // gap=4, criticality=0.9, risk_reduction=5, effort=1
    // (4*0.5) + (0.9*0.3) + (5/1*0.2) = 2.0 + 0.27 + 1.0 = 3.27
    expect(calculatePriorityScore(4, 0.9, 5, 1)).toBe(3.27);
  });

  it('produces higher scores for larger gaps', () => {
    const scoreGap1 = calculatePriorityScore(1, 0.9, 4, 2);
    const scoreGap4 = calculatePriorityScore(4, 0.9, 4, 2);
    expect(scoreGap4).toBeGreaterThan(scoreGap1);
  });

  it('produces higher scores for higher criticality', () => {
    const scoreLow = calculatePriorityScore(2, 0.7, 4, 2);
    const scoreHigh = calculatePriorityScore(2, 1.0, 4, 2);
    expect(scoreHigh).toBeGreaterThan(scoreLow);
  });

  it('produces higher scores for better risk/effort ratio', () => {
    const scoreLowEfficiency = calculatePriorityScore(2, 0.9, 2, 3);
    const scoreHighEfficiency = calculatePriorityScore(2, 0.9, 5, 1);
    expect(scoreHighEfficiency).toBeGreaterThan(scoreLowEfficiency);
  });
});

describe('mapScoreToPriorityLevel', () => {
  it('returns CRITICAL for score >= 4.0', () => {
    expect(mapScoreToPriorityLevel(4.0)).toBe('CRITICAL');
    expect(mapScoreToPriorityLevel(5.5)).toBe('CRITICAL');
  });

  it('returns HIGH for score >= 3.0 and < 4.0', () => {
    expect(mapScoreToPriorityLevel(3.0)).toBe('HIGH');
    expect(mapScoreToPriorityLevel(3.99)).toBe('HIGH');
  });

  it('returns MEDIUM for score >= 2.0 and < 3.0', () => {
    expect(mapScoreToPriorityLevel(2.0)).toBe('MEDIUM');
    expect(mapScoreToPriorityLevel(2.99)).toBe('MEDIUM');
  });

  it('returns LOW for score < 2.0', () => {
    expect(mapScoreToPriorityLevel(1.99)).toBe('LOW');
    expect(mapScoreToPriorityLevel(0.5)).toBe('LOW');
    expect(mapScoreToPriorityLevel(0)).toBe('LOW');
  });
});

describe('assignRoadmapPhase', () => {
  // CRITICAL priority
  it('assigns QUICK_WIN for CRITICAL priority + LOW effort', () => {
    expect(assignRoadmapPhase('CRITICAL', 'LOW')).toBe('QUICK_WIN');
  });

  it('assigns SHORT_TERM for CRITICAL priority + MEDIUM effort', () => {
    expect(assignRoadmapPhase('CRITICAL', 'MEDIUM')).toBe('SHORT_TERM');
  });

  it('assigns SHORT_TERM for CRITICAL priority + HIGH effort', () => {
    expect(assignRoadmapPhase('CRITICAL', 'HIGH')).toBe('SHORT_TERM');
  });

  // HIGH priority
  it('assigns QUICK_WIN for HIGH priority + LOW effort', () => {
    expect(assignRoadmapPhase('HIGH', 'LOW')).toBe('QUICK_WIN');
  });

  it('assigns SHORT_TERM for HIGH priority + MEDIUM effort', () => {
    expect(assignRoadmapPhase('HIGH', 'MEDIUM')).toBe('SHORT_TERM');
  });

  it('assigns MEDIUM_TERM for HIGH priority + HIGH effort', () => {
    expect(assignRoadmapPhase('HIGH', 'HIGH')).toBe('MEDIUM_TERM');
  });

  // MEDIUM priority
  it('assigns SHORT_TERM for MEDIUM priority + LOW effort', () => {
    expect(assignRoadmapPhase('MEDIUM', 'LOW')).toBe('SHORT_TERM');
  });

  it('assigns MEDIUM_TERM for MEDIUM priority + MEDIUM effort', () => {
    expect(assignRoadmapPhase('MEDIUM', 'MEDIUM')).toBe('MEDIUM_TERM');
  });

  it('assigns LONG_TERM for MEDIUM priority + HIGH effort', () => {
    expect(assignRoadmapPhase('MEDIUM', 'HIGH')).toBe('LONG_TERM');
  });

  // LOW priority
  it('assigns SHORT_TERM for LOW priority + LOW effort', () => {
    expect(assignRoadmapPhase('LOW', 'LOW')).toBe('SHORT_TERM');
  });

  it('assigns LONG_TERM for LOW priority + MEDIUM effort', () => {
    expect(assignRoadmapPhase('LOW', 'MEDIUM')).toBe('LONG_TERM');
  });

  it('assigns LONG_TERM for LOW priority + HIGH effort', () => {
    expect(assignRoadmapPhase('LOW', 'HIGH')).toBe('LONG_TERM');
  });

  // General property: higher priority + lower effort → earlier phase
  it('assigns earlier phases for higher priority with same effort', () => {
    const phases = ['QUICK_WIN', 'SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM'];
    const criticalPhase = phases.indexOf(assignRoadmapPhase('CRITICAL', 'MEDIUM'));
    const lowPhase = phases.indexOf(assignRoadmapPhase('LOW', 'MEDIUM'));
    expect(criticalPhase).toBeLessThan(lowPhase);
  });
});
