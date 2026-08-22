import { z } from "zod";

export const AIRecommendationExplanationSchema = z.object({
  destinationId: z.string(),
  cityName: z.string(),
  explanation: z.string().min(10),
  keyHighlight: z.string().optional(),
});

export type AIRecommendationExplanation = z.infer<
  typeof AIRecommendationExplanationSchema
>;
