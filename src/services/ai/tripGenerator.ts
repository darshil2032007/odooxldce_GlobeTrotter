import { invokeGeminiAssistant } from "./client";
import { AITripPlanSchema, type AITripPlan } from "./schemas/tripPlan";
import { getCities } from "@/services/data/cities";
import { getActivities } from "@/services/data/activities";
import { createTrip } from "@/services/data/trips";
import { createStop } from "@/services/data/stops";
import { createStopActivity } from "@/services/data/stopActivities";
import type { City } from "@/types/database";

export interface GenerateTripParams {
  prompt: string;
  targetBudget?: number;
  durationDays?: number;
  travelStyle?: string;
  interests?: string[];
}

export interface ResolvedTripStop {
  city: City;
  stayDays: number;
  reasoning?: string | null;
  days: {
    dayNumber: number;
    theme?: string | null;
    activities: {
      title: string;
      category: string;
      scheduledTime?: string | null;
      durationHours: number;
      estimatedCost: number;
      description?: string | null;
      catalogActivityId?: string | null;
    }[];
  }[];
}

export interface ResolvedTripPlan {
  title: string;
  summary: string;
  recommendedTravelStyle: string;
  estimatedTotalCost: number;
  currency: string;
  startDate: string;
  endDate: string;
  stops: ResolvedTripStop[];
  rawAIPlan: AITripPlan;
}

/**
 * Invokes Gemini via server Edge Function and validates structured trip plan schema.
 */
export async function generateAITripPlan(
  params: GenerateTripParams
): Promise<ResolvedTripPlan> {
  // Fetch available catalog cities to help context matching
  const catalogCities = await getCities();
  const catalogActivities = await getActivities();

  const catalogSummary = catalogCities
    .map((c) => `${c.name} (${c.country}, ${c.region || ""})`)
    .join(", ");

  const result = await invokeGeminiAssistant<AITripPlan>({
    action: "generate-trip",
    payload: {
      ...params,
      catalogSummary,
    },
  });

  // Validate response with Zod
  const parseResult = AITripPlanSchema.safeParse(result.data);
  if (!parseResult.success) {
    console.error("AI Plan validation failed:", parseResult.error);
    throw new Error("AI returned an invalid trip plan structure. Please try again.");
  }

  const aiPlan = parseResult.data;

  // Match AI cities and activities against real Supabase catalog entities
  const resolvedStops: ResolvedTripStop[] = [];

  for (const stop of aiPlan.stops) {
    // Find closest matching city in catalog
    const matchedCity =
      catalogCities.find(
        (c) => c.name.toLowerCase().trim() === stop.cityName.toLowerCase().trim()
      ) ||
      catalogCities.find((c) =>
        stop.cityName.toLowerCase().includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(stop.cityName.toLowerCase())
      ) ||
      catalogCities[0] || {
        id: `city-custom-${Date.now()}`,
        name: stop.cityName,
        country: stop.country || "India",
        region: null,
        cost_index: 50,
        popularity_score: 80,
        latitude: null,
        longitude: null,
        image_url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
        description: stop.reasoning || "Curated destination",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

    const resolvedDays = stop.days.map((day) => {
      const resolvedActivities = day.activities.map((act) => {
        // Match activity against catalog if possible
        const matchedAct = catalogActivities.find(
          (a) =>
            a.city_id === matchedCity.id &&
            a.title.toLowerCase().includes(act.title.toLowerCase())
        );

        return {
          title: act.title,
          category: act.category,
          scheduledTime: act.scheduledTime || "10:00",
          durationHours: act.durationHours || 2.0,
          estimatedCost: act.estimatedCost,
          description: act.description,
          catalogActivityId: matchedAct?.id || null,
        };
      });

      return {
        dayNumber: day.dayNumber,
        theme: day.theme,
        activities: resolvedActivities,
      };
    });

    resolvedStops.push({
      city: matchedCity,
      stayDays: stop.stayDays,
      reasoning: stop.reasoning,
      days: resolvedDays,
    });
  }

  // Calculate default dates starting tomorrow
  const today = new Date();
  const startDateObj = new Date(today);
  startDateObj.setDate(today.getDate() + 1);

  const totalDuration = resolvedStops.reduce((acc, s) => acc + s.stayDays, 0);
  const endDateObj = new Date(startDateObj);
  endDateObj.setDate(startDateObj.getDate() + Math.max(1, totalDuration - 1));

  const startDate = startDateObj.toISOString().split("T")[0];
  const endDate = endDateObj.toISOString().split("T")[0];

  return {
    title: aiPlan.title,
    summary: aiPlan.summary,
    recommendedTravelStyle: aiPlan.recommendedTravelStyle,
    estimatedTotalCost: aiPlan.estimatedTotalCost,
    currency: aiPlan.currency,
    startDate,
    endDate,
    stops: resolvedStops,
    rawAIPlan: aiPlan,
  };
}

/**
 * Commits a user-approved AI Trip Plan into Supabase.
 * Strictly uses existing application services and creates real database relational records.
 */
export async function commitAITripPlan(
  plan: ResolvedTripPlan,
  userId: string
): Promise<string> {
  // 1. Create Trip row
  const newTrip = await createTrip({
    user_id: userId,
    title: plan.title,
    description: plan.summary,
    start_date: plan.startDate,
    end_date: plan.endDate,
    target_budget: plan.estimatedTotalCost,
    cover_image_url: plan.stops[0]?.city?.image_url || null,
    is_public: false,
    share_slug: null,
  });

  const tripId = newTrip.id;

  // 2. Create Stops and Stop Activities sequentially
  let currentDayOffset = 0;

  for (let idx = 0; idx < plan.stops.length; idx++) {
    const stopPlan = plan.stops[idx];

    const stopStart = new Date(plan.startDate);
    stopStart.setDate(stopStart.getDate() + currentDayOffset);

    const stopEnd = new Date(stopStart);
    stopEnd.setDate(stopStart.getDate() + (stopPlan.stayDays - 1));

    const newStop = await createStop({
      trip_id: tripId,
      city_id: stopPlan.city.id,
      stop_order: idx + 1,
      arrival_date: stopStart.toISOString().split("T")[0],
      departure_date: stopEnd.toISOString().split("T")[0],
    });

    // Insert scheduled activities
    for (const day of stopPlan.days) {
      const actualDayNumber = currentDayOffset + day.dayNumber;

      for (const act of day.activities) {
        await createStopActivity({
          stop_id: newStop.id,
          activity_id: act.catalogActivityId || null,
          day_number: actualDayNumber,
          scheduled_time: act.scheduledTime || "10:00",
          cost: act.estimatedCost,
          notes: act.description ? `${act.title} - ${act.description}` : act.title,
          is_completed: false,
        });
      }
    }

    currentDayOffset += stopPlan.stayDays;
  }

  return tripId;
}
