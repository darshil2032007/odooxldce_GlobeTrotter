import { z } from "zod";

export const AIActivitySchema = z.object({
  title: z.string().min(2),
  category: z.string().default("Activities"),
  scheduledTime: z.string().optional().nullable(),
  durationHours: z.number().default(2.0),
  estimatedCost: z.number().nonnegative().default(0),
  description: z.string().optional().nullable(),
});

export const AIDayPlanSchema = z.object({
  dayNumber: z.number().int().positive(),
  theme: z.string().optional().nullable(),
  activities: z.array(AIActivitySchema).min(1),
});

export const AIStopPlanSchema = z.object({
  cityName: z.string().min(2),
  country: z.string().default("India"),
  stayDays: z.number().int().positive().default(1),
  reasoning: z.string().optional().nullable(),
  days: z.array(AIDayPlanSchema).min(1),
});

export const AITripPlanSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(10),
  recommendedTravelStyle: z
    .enum(["budget", "moderate", "luxury", "backpacker"])
    .default("moderate"),
  estimatedTotalCost: z.number().nonnegative(),
  currency: z.string().default("INR"),
  stops: z.array(AIStopPlanSchema).min(1),
});

export type AIActivity = z.infer<typeof AIActivitySchema>;
export type AIDayPlan = z.infer<typeof AIDayPlanSchema>;
export type AIStopPlan = z.infer<typeof AIStopPlanSchema>;
export type AITripPlan = z.infer<typeof AITripPlanSchema>;
