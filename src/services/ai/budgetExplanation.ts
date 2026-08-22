import { invokeGeminiAssistant } from "./client";
import type { SmartAssistantAnalysis } from "@/features/assistant/types";

/**
 * Transforms verified deterministic budget numbers into natural-language advice using Gemini.
 * The numbers MUST come strictly from the deterministic engine.
 */
export async function getAIBudgetExplanation(
  analysis: SmartAssistantAnalysis
): Promise<string> {
  const topSuggestion =
    analysis.suggestions.length > 0
      ? analysis.suggestions[0].description
      : "No changes needed";

  const result = await invokeGeminiAssistant<string>({
    action: "budget-explanation",
    payload: {
      targetBudget: analysis.targetBudget,
      currentCost: analysis.currentCost,
      deficit: analysis.deficit,
      percentageUsed: analysis.percentageUsed,
      mostExpensiveCategory: analysis.mostExpensiveCategory,
      mostExpensiveDay: analysis.mostExpensiveDay,
      topSuggestion,
      totalPotentialSavings: analysis.totalPotentialSavings,
    },
  });

  return (
    result.data ||
    `Your trip total of ₹${analysis.currentCost.toLocaleString("en-IN")} is being tracked deterministically against your target budget of ₹${analysis.targetBudget.toLocaleString("en-IN")}.`
  );
}
