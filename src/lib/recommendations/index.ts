// src/lib/recommendations/index.ts

export {
  RECOMMENDATION_TEMPLATES,
  FUNCTION_NAMES,
  classifyCategory,
  type ControlCategory,
  type RecommendationTemplate,
} from './templates';

export {
  generateRecommendationsForGaps,
  type GapInput,
  type GeneratedRecommendation,
} from './engine';

export {
  calculatePriorityScore,
  mapScoreToPriorityLevel,
  assignRoadmapPhase,
  FUNCTION_CRITICALITY_WEIGHTS,
  type PriorityLevel,
  type EffortLevel,
  type RoadmapPhase,
} from './prioritization';
