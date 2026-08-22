import type { TripWithDetails, Activity } from "@/types/database";
import type { TripBudgetCalculation } from "../types";
import type {
  SmartAssistantAnalysis,
  BudgetSuggestion,
  ActivityToReplace,
  ReplacementActivityOption,
} from "@/features/assistant/types";

/**
 * Deterministic Smart Budget Assistant Algorithm.
 *
 * Rules:
 * 1. Checks if trip is over budget and computes exact deficit.
 * 2. Identifies most expensive categories, days, and individual activities.
 * 3. Scans available catalog activities in the same city for cheaper alternatives (same category preferred).
 * 4. Calculates exact deterministic savings: currentCost - suggestedCost.
 * 5. Ranks recommendations by impact (solves deficit > major saving > moderate saving).
 * 6. Emits structured recommendation models ready for direct UI preview & 1-click replacement.
 */
export function generateBudgetSuggestions(
  trip: TripWithDetails,
  budget: TripBudgetCalculation,
  availableCatalogActivities: Activity[] = []
): SmartAssistantAnalysis {
  const isOverBudget = budget.isOverBudget;
  const deficit = budget.overBudgetAmount;
  const currentCost = budget.total;
  const targetBudget = budget.targetBudget;

  const suggestions: BudgetSuggestion[] = [];

  // Extract scheduled activities with valid costs
  const activitiesToConsider: ActivityToReplace[] = [];
  const scheduledActivityIds = new Set<string>();

  for (const stop of trip.stops || []) {
    const cityName = stop.city?.name || "Destination";
    const cityId = stop.city_id;

    for (const sa of stop.stop_activities || []) {
      const cost = Number(sa.cost ?? sa.activity?.estimated_cost ?? 0);
      const title = sa.activity?.title || sa.notes || "Activity";
      const category = sa.activity?.category || "Activities";

      if (sa.activity_id) {
        scheduledActivityIds.add(sa.activity_id);
      }

      if (cost > 0) {
        activitiesToConsider.push({
          stopActivityId: sa.id,
          stopId: stop.id,
          activityId: sa.activity_id,
          title,
          cost,
          dayNumber: sa.day_number || 1,
          cityName,
          cityId,
          category,
        });
      }
    }
  }

  // Sort activities by cost descending
  activitiesToConsider.sort((a, b) => b.cost - a.cost);

  // Match cheaper alternatives from catalog
  for (const act of activitiesToConsider) {
    // Find candidate activities in same city
    const sameCityCandidates = availableCatalogActivities.filter(
      (cand) =>
        cand.city_id === act.cityId &&
        cand.id !== act.activityId &&
        !scheduledActivityIds.has(cand.id) &&
        Number(cand.estimated_cost || 0) < act.cost
    );

    if (sameCityCandidates.length > 0) {
      // Sort candidates: same category first, then by lowest cost / best savings
      sameCityCandidates.sort((a, b) => {
        const aSameCat = a.category.toLowerCase() === act.category.toLowerCase();
        const bSameCat = b.category.toLowerCase() === act.category.toLowerCase();
        if (aSameCat && !bSameCat) return -1;
        if (!aSameCat && bSameCat) return 1;
        return Number(a.estimated_cost || 0) - Number(b.estimated_cost || 0);
      });

      const topReplacement = sameCityCandidates[0];
      const replacementCost = Number(topReplacement.estimated_cost || 0);
      const savings = act.cost - replacementCost;

      if (savings > 0) {
        let impact: BudgetSuggestion["impact"] = "moderate_saving";
        if (isOverBudget && savings >= deficit) {
          impact = "solves_deficit";
        } else if (savings >= 1000 || savings >= act.cost * 0.5) {
          impact = "major_saving";
        }

        const replacementOption: ReplacementActivityOption = {
          id: topReplacement.id,
          title: topReplacement.title,
          estimatedCost: replacementCost,
          category: topReplacement.category,
          cityName: act.cityName,
          cityId: topReplacement.city_id,
          durationHours: topReplacement.duration_hours,
          imageUrl: topReplacement.image_url,
          description: topReplacement.description,
        };

        const isFree = replacementCost === 0;

        suggestions.push({
          id: `sug-${act.stopActivityId}-${topReplacement.id}`,
          type: isFree ? "free_alternative" : "replace_activity",
          title: `Replace ${act.title} in ${act.cityName}`,
          description: `Swap with ${topReplacement.title} (${topReplacement.category}) to save ₹${savings.toLocaleString("en-IN")}.`,
          currentCost: act.cost,
          suggestedCost: replacementCost,
          savings,
          impact,
          activityToReplace: act,
          replacementActivity: replacementOption,
          reasoning:
            topReplacement.category.toLowerCase() === act.category.toLowerCase()
              ? `Both are ${topReplacement.category} experiences in ${act.cityName}, offering high value at lower cost.`
              : `A popular experience in ${act.cityName} with significant cost savings.`,
        });
      }
    } else if (act.cost >= 2000) {
      // If no direct catalog item in same city, provide a smart free/budget alternative rule
      const potentialCost = 0;
      const savings = act.cost - potentialCost;
      let impact: BudgetSuggestion["impact"] = "moderate_saving";
      if (isOverBudget && savings >= deficit) {
        impact = "solves_deficit";
      } else if (savings >= 1000) {
        impact = "major_saving";
      }

      suggestions.push({
        id: `sug-self-${act.stopActivityId}`,
        type: "free_alternative",
        title: `Self-Guided Alternative for ${act.title}`,
        description: `Consider self-guided exploration or scenic walking trails in ${act.cityName} to eliminate the ₹${act.cost.toLocaleString("en-IN")} booking fee.`,
        currentCost: act.cost,
        suggestedCost: 0,
        savings,
        impact,
        activityToReplace: act,
        reasoning: `Self-guided or city-walk alternatives in ${act.cityName} provide great cultural immersion with zero ticket costs.`,
      });
    }
  }

  // Sort suggestions: "solves_deficit" first, then highest savings descending
  suggestions.sort((a, b) => {
    if (a.impact === "solves_deficit" && b.impact !== "solves_deficit") return -1;
    if (b.impact === "solves_deficit" && a.impact !== "solves_deficit") return 1;
    return b.savings - a.savings;
  });

  const totalPotentialSavings = suggestions.reduce((acc, s) => acc + s.savings, 0);

  // Generate deterministic summary message
  let summaryMessage = "";
  if (isOverBudget) {
    if (suggestions.some((s) => s.impact === "solves_deficit")) {
      summaryMessage = `Your trip is ₹${deficit.toLocaleString("en-IN")} over budget. We found suggestions that can bring your entire trip back within budget!`;
    } else {
      summaryMessage = `Your trip is ₹${deficit.toLocaleString("en-IN")} over budget. Applying our recommendations can save up to ₹${totalPotentialSavings.toLocaleString("en-IN")}.`;
    }
  } else if (budget.percentageUsed >= 90) {
    summaryMessage = `You are near your target budget (${budget.percentageUsed}% used). Here are optimizations to create a safer budget buffer.`;
  } else {
    summaryMessage = `Your budget is healthy! You have ₹${budget.remaining.toLocaleString("en-IN")} remaining.`;
  }

  return {
    isOverBudget,
    targetBudget,
    currentCost,
    deficit,
    savingsNeeded: deficit,
    percentageUsed: budget.percentageUsed,
    mostExpensiveCategory: budget.mostExpensiveCategory,
    mostExpensiveDay: budget.mostExpensiveDay,
    totalPotentialSavings,
    suggestions,
    summaryMessage,
  };
}
