import { z } from "zod";

export const AIOptimizationSuggestionSchema = z.object({
  id: z.string(),
  type: z.enum([
    "replace_activity",
    "remove_activity",
    "rebalance_day",
    "reduce_pace",
  ]),
  title: z.string(),
  currentActivityTitle: z.string().optional().nullable(),
  replacementActivityTitle: z.string().optional().nullable(),
  cityName: z.string().optional().nullable(),
  dayNumber: z.number().int().positive().optional().nullable(),
  reason: z.string(),
  estimatedCostDifference: z.number().default(0),
});

export const AIOptimizationResponseSchema = z.object({
  summary: z.string(),
  expectedTotalSavings: z.number().nonnegative().default(0),
  paceImprovement: z.string().optional().nullable(),
  suggestions: z.array(AIOptimizationSuggestionSchema),
});

export type AIOptimizationSuggestion = z.infer<
  typeof AIOptimizationSuggestionSchema
>;
export type AIOptimizationResponse = z.infer<
  typeof AIOptimizationResponseSchema
>;
