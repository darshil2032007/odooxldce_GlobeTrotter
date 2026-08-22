import type { TripWithDetails, StopWithDetails } from "@/types/database";
import type { DayPlan, ItineraryValidationIssue } from "../types";

/**
 * Convert HH:MM string to total minutes from midnight.
 */
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Validate itinerary schedule and identify conflicts, overlaps, and date mismatches.
 */
export function validateItinerarySchedule(
  trip: TripWithDetails,
  stops: StopWithDetails[],
  derivedDays: DayPlan[]
): {
  allIssues: ItineraryValidationIssue[];
  daysWithIssues: Map<number, ItineraryValidationIssue[]>;
  stopIssues: Map<string, ItineraryValidationIssue[]>;
} {
  const allIssues: ItineraryValidationIssue[] = [];
  const daysWithIssues = new Map<number, ItineraryValidationIssue[]>();
  const stopIssues = new Map<string, ItineraryValidationIssue[]>();

  const totalTripDays = derivedDays.length;

  // 1. Check Stop Date Inversions & Out-of-bounds relative to Trip dates
  stops.forEach((stop) => {
    if (stop.arrival_date && stop.departure_date) {
      if (stop.arrival_date > stop.departure_date) {
        const issue: ItineraryValidationIssue = {
          type: "invalid_stop_dates",
          severity: "error",
          message: `Stop "${stop.city?.name || "Stop"}" has departure date before arrival date.`,
          stopId: stop.id,
        };
        allIssues.push(issue);
        const existing = stopIssues.get(stop.id) || [];
        stopIssues.set(stop.id, [...existing, issue]);
      }
    }

    if (stop.arrival_date && trip.start_date && stop.arrival_date < trip.start_date) {
      const issue: ItineraryValidationIssue = {
        type: "invalid_stop_dates",
        severity: "warning",
        message: `Stop "${stop.city?.name || "Stop"}" arrives before the trip start date.`,
        stopId: stop.id,
      };
      allIssues.push(issue);
    }
  });

  // 2. Validate Activities per day (Timing Overlaps, Out of dates, Mismatched cities)
  derivedDays.forEach((day) => {
    const dayIssues: ItineraryValidationIssue[] = [];
    const activities = day.activities;

    // Check time overlaps
    const timedActivities = activities
      .filter((a) => Boolean(a.scheduled_time))
      .map((a) => {
        const startMin = timeToMinutes(a.scheduled_time!);
        const durationHours = a.activity?.duration_hours ?? 1.5;
        const endMin = startMin + durationHours * 60;
        return {
          item: a,
          startMin,
          endMin,
          title: a.activity?.title || a.notes || "Activity",
        };
      })
      .sort((a, b) => a.startMin - b.startMin);

    for (let i = 0; i < timedActivities.length - 1; i++) {
      const current = timedActivities[i];
      const next = timedActivities[i + 1];

      // If next activity starts before current activity finishes
      if (next.startMin < current.endMin) {
        const issue: ItineraryValidationIssue = {
          type: "overlap",
          severity: "warning",
          message: `Timing overlap on Day ${day.dayNumber}: "${current.title}" (${current.item.scheduled_time}) and "${next.title}" (${next.item.scheduled_time}) overlap.`,
          dayNumber: day.dayNumber,
          activityId: next.item.id,
        };
        allIssues.push(issue);
        dayIssues.push(issue);
      }
    }

    // Check city mismatch & out-of-dates
    activities.forEach((act) => {
      // Out-of-trip dates
      if (act.day_number < 1 || act.day_number > totalTripDays) {
        const issue: ItineraryValidationIssue = {
          type: "out_of_dates",
          severity: "warning",
          message: `"${act.activity?.title || "Activity"}" is scheduled for Day ${act.day_number}, which is outside the ${totalTripDays}-day itinerary.`,
          dayNumber: act.day_number,
          activityId: act.id,
        };
        allIssues.push(issue);
        dayIssues.push(issue);
      }

      // City mismatch
      if (act.activity && day.city && act.activity.city_id !== day.city.id) {
        const stopCityName = day.city.name;
        const actTitle = act.activity.title;
        const issue: ItineraryValidationIssue = {
          type: "city_mismatch",
          severity: "warning",
          message: `"${actTitle}" is a catalog activity from another destination, scheduled under ${stopCityName}.`,
          dayNumber: day.dayNumber,
          activityId: act.id,
        };
        allIssues.push(issue);
        dayIssues.push(issue);
      }
    });

    if (dayIssues.length > 0) {
      daysWithIssues.set(day.dayNumber, dayIssues);
    }
  });

  return { allIssues, daysWithIssues, stopIssues };
}
