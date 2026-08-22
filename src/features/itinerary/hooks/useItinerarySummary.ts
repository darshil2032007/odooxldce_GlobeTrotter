import { useMemo } from "react";
import type { TripWithDetails } from "@/types/database";
import type { ItinerarySummaryData } from "../types";
import { deriveItineraryDays } from "../utils/dayCalculations";
import { useTripDetails } from "./useItinerary";

/**
 * Pure data transformation utility to derive clean, structured
 * itinerary and activity metrics for Developer 4's Budget Engine.
 */
export function getItineraryDataForBudget(trip: TripWithDetails): ItinerarySummaryData {
  const stops = trip.stops || [];
  const days = deriveItineraryDays(trip.start_date, trip.end_date, stops);

  let totalActivityCost = 0;
  let totalActivitiesCount = 0;
  let completedActivitiesCount = 0;

  const categoryMap = new Map<string, { totalCost: number; count: number }>();
  const cityMap = new Map<string, { cityName: string; totalCost: number; activityCount: number }>();
  const flatActivities: ItinerarySummaryData["activities"] = [];

  stops.forEach((stop) => {
    const cityId = stop.city_id;
    const cityName = stop.city?.name || "Unknown City";

    if (!cityMap.has(cityId)) {
      cityMap.set(cityId, { cityName, totalCost: 0, activityCount: 0 });
    }

    const cityEntry = cityMap.get(cityId)!;

    (stop.stop_activities || []).forEach((sa) => {
      const actCost = sa.cost || 0;
      const category = sa.activity?.category || "Custom Plan";
      const title = sa.activity?.title || sa.notes || "Activity";

      totalActivityCost += actCost;
      totalActivitiesCount += 1;
      if (sa.is_completed) completedActivitiesCount += 1;

      // Update City metrics
      cityEntry.totalCost += actCost;
      cityEntry.activityCount += 1;

      // Update Category metrics
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { totalCost: 0, count: 0 });
      }
      const catEntry = categoryMap.get(category)!;
      catEntry.totalCost += actCost;
      catEntry.count += 1;

      // Flat activity list
      flatActivities.push({
        id: sa.id,
        stopId: stop.id,
        cityId,
        cityName,
        title,
        category,
        dayNumber: sa.day_number,
        scheduledTime: sa.scheduled_time,
        cost: actCost,
        isCompleted: sa.is_completed,
        notes: sa.notes,
      });
    });
  });

  // Cost per day calculation
  const costPerDay = days.map((d) => ({
    dayNumber: d.dayNumber,
    date: d.dateStr || "",
    totalCost: d.totalDayCost,
    activityCount: d.activities.length,
  }));

  // Cost per city list
  const costPerCity = Array.from(cityMap.entries()).map(([cityId, val]) => ({
    cityId,
    cityName: val.cityName,
    totalCost: val.totalCost,
    activityCount: val.activityCount,
  }));

  // Cost by category list
  const costByCategory = Array.from(categoryMap.entries()).map(([category, val]) => ({
    category,
    totalCost: val.totalCost,
    count: val.count,
  }));

  return {
    totalActivityCost,
    costPerDay,
    costPerCity,
    costByCategory,
    totalActivitiesCount,
    completedActivitiesCount,
    activities: flatActivities,
  };
}

/**
 * Developer 4 Integration Hook: Exposes clean structured itinerary
 * statistics & cost breakdowns for any trip without needing UI components.
 */
export function useItinerarySummary(tripId: string) {
  const { data: trip, isLoading, isError } = useTripDetails(tripId);

  const summary = useMemo(() => {
    if (!trip) return null;
    return getItineraryDataForBudget(trip);
  }, [trip]);

  return {
    summary,
    trip,
    isLoading,
    isError,
  };
}
