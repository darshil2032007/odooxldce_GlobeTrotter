import { invokeGeminiAssistant } from "./client";
import type { ScoredDestination, UserPreferences } from "@/features/recommendations/types";

/**
 * Generates personalized Gemini reasoning for why a scored destination fits the traveler.
 * The score remains strictly deterministic from scoringEngine.ts.
 */
export async function getAIDestinationExplanation(
  destination: ScoredDestination,
  preferences: UserPreferences
): Promise<string> {
  const result = await invokeGeminiAssistant<string>({
    action: "recommendation-explanation",
    payload: {
      cityName: destination.city.name,
      country: destination.city.country,
      score: destination.score,
      targetBudget: preferences.targetBudget,
      durationDays: preferences.durationDays,
      travelStyle: preferences.travelStyle,
      interests: preferences.interests,
      budgetFit: Math.round(destination.breakdown.budgetMatch * 100),
      interestFit: Math.round(destination.breakdown.interestMatch * 100),
      popularity: Math.round(destination.breakdown.popularity * 100),
    },
  });

  return (
    result.data ||
    `${destination.city.name} is a top ${destination.score}% match because it fits your ₹${preferences.targetBudget.toLocaleString("en-IN")} budget and matches your ${preferences.travelStyle} travel style.`
  );
}
