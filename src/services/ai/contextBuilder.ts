import type { TripWithDetails } from "@/types/database";
import { calculateTripBudget } from "@/features/budget/engine/calculator";
import { generateBudgetSuggestions } from "@/features/budget/engine/assistantEngine";

export interface CompactTripAIContext {
  tripId: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  durationDays: number;
  targetBudget: number;
  totalEstimatedCost: number;
  remainingBudget: number;
  isOverBudget: boolean;
  overBudgetDeficit: number;
  percentageUsed: number;
  costPerDay: number;
  mostExpensiveCategory?: string | null;
  mostExpensiveDay?: number | null;
  destinations: {
    cityName: string;
    country: string;
    stopOrder: number;
    activityCount: number;
  }[];
  itineraryDays: {
    dayNumber: number;
    cityName: string;
    totalDayCost: number;
    activities: {
      title: string;
      category: string;
      cost: number;
      scheduledTime?: string | null;
      durationHours?: number;
    }[];
  }[];
  deterministicSuggestions: {
    type: string;
    title: string;
    savings: number;
  }[];
}

/**
 * Builds a compact, token-efficient, factual context object for Gemini queries.
 * Ensures the LLM receives verified deterministic financial figures without database bloat.
 */
export function buildTripAIContext(
  trip: TripWithDetails
): CompactTripAIContext {
  const budget = calculateTripBudget(trip);
  const assistantAnalysis = generateBudgetSuggestions(trip, budget);

  const stops = trip.stops || [];

  // Group activities into days with city references
  const daysMap = new Map<
    number,
    {
      cityName: string;
      totalCost: number;
      activities: CompactTripAIContext["itineraryDays"][0]["activities"];
    }
  >();

  stops.forEach((stop) => {
    const cityName = stop.city?.name || "Destination";
    (stop.stop_activities || []).forEach((sa) => {
      const dayNum = sa.day_number || 1;
      if (!daysMap.has(dayNum)) {
        daysMap.set(dayNum, { cityName, totalCost: 0, activities: [] });
      }
      const dayEntry = daysMap.get(dayNum)!;
      const cost = Number(sa.cost ?? sa.activity?.estimated_cost ?? 0);
      dayEntry.totalCost += cost;
      dayEntry.activities.push({
        title: sa.activity?.title || sa.notes || "Activity",
        category: sa.activity?.category || "Activities",
        cost,
        scheduledTime: sa.scheduled_time,
        durationHours: sa.activity?.duration_hours || 2,
      });
    });
  });

  const itineraryDays = Array.from(daysMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([dayNumber, data]) => ({
      dayNumber,
      cityName: data.cityName,
      totalDayCost: data.totalCost,
      activities: data.activities,
    }));

  const destinations = stops.map((s) => ({
    cityName: s.city?.name || "Destination",
    country: s.city?.country || "India",
    stopOrder: s.stop_order,
    activityCount: s.stop_activities?.length || 0,
  }));

  const deterministicSuggestions = assistantAnalysis.suggestions.slice(0, 3).map((s) => ({
    type: s.type,
    title: s.title,
    savings: s.savings,
  }));

  return {
    tripId: trip.id,
    title: trip.title,
    description: trip.description,
    startDate: trip.start_date,
    endDate: trip.end_date,
    durationDays: budget.durationDays,
    targetBudget: budget.targetBudget,
    totalEstimatedCost: budget.total,
    remainingBudget: budget.remaining,
    isOverBudget: budget.isOverBudget,
    overBudgetDeficit: budget.overBudgetAmount,
    percentageUsed: budget.percentageUsed,
    costPerDay: budget.costPerDay,
    mostExpensiveCategory: budget.mostExpensiveCategory?.category || null,
    mostExpensiveDay: budget.mostExpensiveDay?.dayNumber || null,
    destinations,
    itineraryDays,
    deterministicSuggestions,
  };
}
