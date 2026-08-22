import type { City, Activity } from "@/types/database";

export type TravelStyle = "budget" | "moderate" | "luxury" | "backpacker";

export interface UserPreferences {
  targetBudget: number;
  durationDays: number;
  interests: string[];
  travelStyle: TravelStyle;
}

export interface ScoreBreakdown {
  budgetMatch: number; // 0..1 (weight: 0.35)
  interestMatch: number; // 0..1 (weight: 0.35)
  durationMatch: number; // 0..1 (weight: 0.15)
  popularity: number; // 0..1 (weight: 0.15)
  totalScore: number; // 0..100
}

export interface ScoredDestination {
  city: City;
  score: number; // 0..100
  breakdown: ScoreBreakdown;
  estimatedTotalCost: number;
  estimatedDailyCost: number;
  matchingInterests: string[];
  sampleActivities: Activity[];
  fitLabel: "Exceptional Match" | "Great Match" | "Good Match" | "Fair Match";
}
