import { invokeGeminiAssistant } from "./client";
import { buildTripAIContext } from "./contextBuilder";
import {
  AIOptimizationResponseSchema,
  type AIOptimizationResponse,
  type AIOptimizationSuggestion,
} from "./schemas/optimization";
import { getActivities } from "@/services/data/activities";
import { updateStopActivity, deleteStopActivity } from "@/services/data/stopActivities";
import type { TripWithDetails } from "@/types/database";

/**
 * Invokes Gemini AI Itinerary Optimizer to analyze schedule congestion and cost efficiency.
 */
export async function getAIOptimizationSuggestions(
  trip: TripWithDetails,
  goal?: string
): Promise<AIOptimizationResponse> {
  const tripContext = buildTripAIContext(trip);

  const result = await invokeGeminiAssistant<AIOptimizationResponse>({
    action: "optimize-trip",
    payload: {
      tripContext,
      goal: goal || "Optimize for cost efficiency and balanced daily pacing",
    },
  });

  const parseResult = AIOptimizationResponseSchema.safeParse(result.data);
  if (!parseResult.success) {
    console.error("AI Optimization validation failed:", parseResult.error);
    throw new Error("Received invalid optimization format from AI.");
  }

  return parseResult.data;
}

/**
 * Applies an approved AI optimization suggestion directly using existing application services.
 */
export async function applyOptimizationSuggestion(
  trip: TripWithDetails,
  suggestion: AIOptimizationSuggestion
): Promise<void> {
  const stops = trip.stops || [];
  const catalogActivities = await getActivities();

  // Locate the target stop_activity
  let targetStopAct: { id: string; stopId: string } | null = null;

  for (const stop of stops) {
    for (const sa of stop.stop_activities || []) {
      const title = sa.activity?.title || sa.notes || "";
      if (
        suggestion.currentActivityTitle &&
        title.toLowerCase().includes(suggestion.currentActivityTitle.toLowerCase())
      ) {
        targetStopAct = { id: sa.id, stopId: stop.id };
        break;
      }
    }
    if (targetStopAct) break;
  }

  if (!targetStopAct) {
    throw new Error(
      `Could not locate activity "${suggestion.currentActivityTitle}" in your current itinerary.`
    );
  }

  if (suggestion.type === "remove_activity") {
    await deleteStopActivity(targetStopAct.id);
  } else if (
    suggestion.type === "replace_activity" &&
    suggestion.replacementActivityTitle
  ) {
    // Find matching replacement in catalog
    const replacement = catalogActivities.find((a) =>
      a.title
        .toLowerCase()
        .includes(suggestion.replacementActivityTitle!.toLowerCase())
    );

    if (replacement) {
      await updateStopActivity(targetStopAct.id, {
        activity_id: replacement.id,
        cost: replacement.estimated_cost,
        notes: replacement.description || replacement.title,
      });
    } else {
      // Update with custom details if catalog activity not found
      await updateStopActivity(targetStopAct.id, {
        notes: `${suggestion.replacementActivityTitle} - ${suggestion.reason}`,
      });
    }
  }
}
