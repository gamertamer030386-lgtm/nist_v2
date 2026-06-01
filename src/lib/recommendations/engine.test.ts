import { describe, it, expect } from 'vitest';
import { generateRecommendationsForGaps, type GapInput } from './engine';
import { RECOMMENDATION_TEMPLATES, FUNCTION_NAMES, classifyCategory } from './templates';

describe('RECOMMENDATION_TEMPLATES', () => {
  it('covers all expected subcategory prefixes', () => {
    const expectedPatterns = [
      'GV.OC', 'GV.RM', 'GV.PO', 'GV.OV', 'GV.RR', 'GV.SC',
      'ID.AM', 'ID.RA', 'ID.IM',
      'PR.AA', 'PR.AT', 'PR.DS', 'PR.PS', 'PR.IR',
      'DE.CM', 'DE.AE',
      'RS.MA', 'RS.AN', 'RS.CO', 'RS.MI',
      'RC.RP', 'RC.CO',
    ];
    const templatePatterns = RECOMMENDATION_TEMPLATES.map((t) => t.pattern);
    for (const pattern of expectedPatterns) {
      expect(templatePatterns).toContain(pattern);
    }
  });

  it('maps governance subcategories to correct categories', () => {
    const findCategory = (pattern: string) =>
      RECOMMENDATION_TEMPLATES.find((t) => t.pattern === pattern)?.category;

    expect(findCategory('GV.OC')).toBe('PROCESS');
    expect(findCategory('GV.RM')).toBe('PROCESS');
    expect(findCategory('GV.PO')).toBe('PROCESS');
    expect(findCategory('GV.OV')).toBe('PROCESS');
    expect(findCategory('GV.RR')).toBe('PEOPLE');
    expect(findCategory('GV.SC')).toBe('PARTNERS');
  });

  it('maps identify subcategories to correct categories', () => {
    const findCategory = (pattern: string) =>
      RECOMMENDATION_TEMPLATES.find((t) => t.pattern === pattern)?.category;

    expect(findCategory('ID.AM')).toBe('TOOLS');
    expect(findCategory('ID.RA')).toBe('PROCESS');
    expect(findCategory('ID.IM')).toBe('PROCESS');
  });

  it('maps protect subcategories to correct categories', () => {
    const findCategory = (pattern: string) =>
      RECOMMENDATION_TEMPLATES.find((t) => t.pattern === pattern)?.category;

    expect(findCategory('PR.AA')).toBe('TOOLS');
    expect(findCategory('PR.AT')).toBe('PEOPLE');
    expect(findCategory('PR.DS')).toBe('TOOLS');
    expect(findCategory('PR.PS')).toBe('TOOLS');
    expect(findCategory('PR.IR')).toBe('TOOLS');
  });

  it('maps detect subcategories to correct categories', () => {
    const findCategory = (pattern: string) =>
      RECOMMENDATION_TEMPLATES.find((t) => t.pattern === pattern)?.category;

    expect(findCategory('DE.CM')).toBe('TOOLS');
    expect(findCategory('DE.AE')).toBe('TOOLS');
  });

  it('maps respond subcategories to correct categories', () => {
    const findCategory = (pattern: string) =>
      RECOMMENDATION_TEMPLATES.find((t) => t.pattern === pattern)?.category;

    expect(findCategory('RS.MA')).toBe('PROCESS');
    expect(findCategory('RS.AN')).toBe('PROCESS');
    expect(findCategory('RS.CO')).toBe('PROCESS');
    expect(findCategory('RS.MI')).toBe('PROCESS');
  });

  it('maps recover subcategories to correct categories', () => {
    const findCategory = (pattern: string) =>
      RECOMMENDATION_TEMPLATES.find((t) => t.pattern === pattern)?.category;

    expect(findCategory('RC.RP')).toBe('PROCESS');
    expect(findCategory('RC.CO')).toBe('PROCESS');
  });

  it('all templates have valid effort levels', () => {
    for (const template of RECOMMENDATION_TEMPLATES) {
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(template.effortLevel);
    }
  });

  it('all templates have description placeholders', () => {
    for (const template of RECOMMENDATION_TEMPLATES) {
      expect(template.description).toContain('{subcategoryName}');
      expect(template.description).toContain('{functionName}');
    }
  });
});

describe('FUNCTION_NAMES', () => {
  it('maps all 6 NIST functions', () => {
    expect(FUNCTION_NAMES).toEqual({
      GV: 'Govern',
      ID: 'Identify',
      PR: 'Protect',
      DE: 'Detect',
      RS: 'Respond',
      RC: 'Recover',
    });
  });
});

describe('classifyCategory', () => {
  it('returns PEOPLE when people keywords dominate', () => {
    const result = classifyCategory(
      'training and awareness for personnel',
      'workforce skill development',
      'PROCESS'
    );
    expect(result).toBe('PEOPLE');
  });

  it('returns TOOLS when technology keywords dominate', () => {
    const result = classifyCategory(
      'deploy monitoring software',
      'automation platform solution',
      'PROCESS'
    );
    expect(result).toBe('TOOLS');
  });

  it('returns PROCESS when process keywords dominate', () => {
    const result = classifyCategory(
      'establish policies and procedures',
      'documentation workflow standard',
      'TOOLS'
    );
    expect(result).toBe('PROCESS');
  });

  it('returns PARTNERS when partner keywords dominate', () => {
    const result = classifyCategory(
      'third-party vendor assessment',
      'external consultant managed service',
      'PROCESS'
    );
    expect(result).toBe('PARTNERS');
  });

  it('returns default category when no keywords match', () => {
    const result = classifyCategory('', '', 'TOOLS');
    expect(result).toBe('TOOLS');
  });
});

describe('generateRecommendationsForGaps', () => {
  it('returns empty array for no gaps', () => {
    const result = generateRecommendationsForGaps([]);
    expect(result).toEqual([]);
  });

  it('skips gaps with value <= 0', () => {
    const gaps: GapInput[] = [
      { subcategoryId: 'GV.OC-01', functionId: 'GV', gap: 0 },
      { subcategoryId: 'GV.OC-02', functionId: 'GV', gap: -1 },
    ];
    const result = generateRecommendationsForGaps(gaps);
    expect(result).toHaveLength(0);
  });

  it('generates a recommendation for a positive gap', () => {
    const gaps: GapInput[] = [
      {
        subcategoryId: 'GV.OC-01',
        subcategoryName: 'Organizational Context',
        functionId: 'GV',
        gap: 2,
      },
    ];
    const result = generateRecommendationsForGaps(gaps);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].subcategoryId).toBe('GV.OC-01');
    expect(result[0].description).toContain('Organizational Context');
    expect(result[0].description).toContain('Govern');
  });

  it('resolves {subcategoryName} and {functionName} placeholders', () => {
    const gaps: GapInput[] = [
      {
        subcategoryId: 'PR.AT-01',
        subcategoryName: 'Security Awareness Training',
        functionId: 'PR',
        gap: 1,
      },
    ];
    const result = generateRecommendationsForGaps(gaps);
    expect(result[0].description).toContain('Security Awareness Training');
    expect(result[0].description).toContain('Protect');
    expect(result[0].description).not.toContain('{subcategoryName}');
    expect(result[0].description).not.toContain('{functionName}');
  });

  it('uses subcategoryId as fallback when subcategoryName is not provided', () => {
    const gaps: GapInput[] = [
      { subcategoryId: 'DE.CM-01', functionId: 'DE', gap: 1 },
    ];
    const result = generateRecommendationsForGaps(gaps);
    expect(result[0].description).toContain('DE.CM-01');
  });

  it('generates additional PARTNERS recommendation for gaps >= 3', () => {
    const gaps: GapInput[] = [
      {
        subcategoryId: 'ID.AM-01',
        subcategoryName: 'Asset Management',
        functionId: 'ID',
        gap: 3,
      },
    ];
    const result = generateRecommendationsForGaps(gaps);
    const partnersRecs = result.filter((r) => r.category === 'PARTNERS');
    expect(partnersRecs.length).toBeGreaterThanOrEqual(1);
    expect(partnersRecs[0].description).toContain('external consultants');
  });

  it('does NOT generate additional PARTNERS recommendation for gaps < 3', () => {
    const gaps: GapInput[] = [
      {
        subcategoryId: 'ID.AM-01',
        subcategoryName: 'Asset Management',
        functionId: 'ID',
        gap: 2,
      },
    ];
    const result = generateRecommendationsForGaps(gaps);
    // The primary recommendation for ID.AM is TOOLS (unless context overrides)
    // There should be no additional PARTNERS recommendation
    const partnersRecs = result.filter(
      (r) => r.category === 'PARTNERS' && r.description.includes('external consultants')
    );
    expect(partnersRecs).toHaveLength(0);
  });

  it('generates PARTNERS recommendation for gap of 4', () => {
    const gaps: GapInput[] = [
      {
        subcategoryId: 'PR.DS-01',
        subcategoryName: 'Data Security',
        functionId: 'PR',
        gap: 4,
      },
    ];
    const result = generateRecommendationsForGaps(gaps);
    const partnersRecs = result.filter(
      (r) => r.category === 'PARTNERS' && r.description.includes('external consultants')
    );
    expect(partnersRecs.length).toBeGreaterThanOrEqual(1);
  });

  it('sorts recommendations by priority score descending', () => {
    const gaps: GapInput[] = [
      { subcategoryId: 'RC.CO-01', functionId: 'RC', gap: 1 },
      { subcategoryId: 'GV.RM-01', functionId: 'GV', gap: 4 },
      { subcategoryId: 'ID.AM-01', functionId: 'ID', gap: 2 },
    ];
    const result = generateRecommendationsForGaps(gaps);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].priorityScore).toBeGreaterThanOrEqual(result[i].priorityScore);
    }
  });

  it('includes all required fields in generated recommendations', () => {
    const gaps: GapInput[] = [
      {
        subcategoryId: 'DE.AE-01',
        subcategoryName: 'Adverse Event Analysis',
        functionId: 'DE',
        gap: 2,
      },
    ];
    const result = generateRecommendationsForGaps(gaps);
    expect(result[0]).toHaveProperty('subcategoryId');
    expect(result[0]).toHaveProperty('category');
    expect(result[0]).toHaveProperty('description');
    expect(result[0]).toHaveProperty('effortLevel');
    expect(result[0]).toHaveProperty('priorityScore');
    expect(result[0]).toHaveProperty('priorityLevel');
    expect(result[0]).toHaveProperty('roadmapPhase');
  });

  it('handles multiple gaps from different functions', () => {
    const gaps: GapInput[] = [
      { subcategoryId: 'GV.OC-01', functionId: 'GV', gap: 1 },
      { subcategoryId: 'ID.AM-01', functionId: 'ID', gap: 2 },
      { subcategoryId: 'PR.AA-01', functionId: 'PR', gap: 3 },
      { subcategoryId: 'DE.CM-01', functionId: 'DE', gap: 1 },
      { subcategoryId: 'RS.MA-01', functionId: 'RS', gap: 2 },
      { subcategoryId: 'RC.RP-01', functionId: 'RC', gap: 1 },
    ];
    const result = generateRecommendationsForGaps(gaps);
    // Should have at least 6 primary recommendations + 1 PARTNERS for PR.AA (gap=3)
    expect(result.length).toBeGreaterThanOrEqual(7);
  });
});
