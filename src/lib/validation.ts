import { z } from "zod";

export const scoreSchema = z.object({
  currentScore: z.number().int().min(1).max(5).nullable().optional(),
  targetScore: z.number().int().min(1).max(5).nullable().optional(),
  comment: z.string().max(2000).nullable().optional(),
});

export type ScoreInput = z.infer<typeof scoreSchema>;
