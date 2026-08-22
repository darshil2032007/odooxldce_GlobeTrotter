import type { StopWithDetails, StopActivityWithDetails } from "@/types/database";
import type { DayPlan } from "../types";

/**
 * Parses date string (YYYY-MM-DD) into local midnight Date to avoid timezone shift.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats local Date to YYYY-MM-DD.
 */
export function formatToDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Formats date into readable string, e.g. "Thu, Sep 10, 2026".
 */
export function formatReadableDate(dateStr: string): string {
  try {
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Automatically derive day-by-day itinerary plans from trip dates and stops.
 */
export function deriveItineraryDays(
  tripStartDate?: string,
  tripEndDate?: string,
  stops: StopWithDetails[] = []
): DayPlan[] {
  // Determine total days
  let totalDays = 5;
  let start = tripStartDate ? parseLocalDate(tripStartDate) : new Date();

  if (tripStartDate && tripEndDate) {
    const end = parseLocalDate(tripEndDate);
    const diffTime = end.getTime() - start.getTime();
    totalDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1, 1);
  } else if (stops.length > 0) {
    // If stops have dates, calculate span
    const dates = stops
      .flatMap((s) => [s.arrival_date, s.departure_date])
      .filter((d): d is string => Boolean(d));
    if (dates.length > 0) {
      dates.sort();
      start = parseLocalDate(dates[0]);
      const end = parseLocalDate(dates[dates.length - 1]);
      totalDays = Math.max(
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
        1
      );
    }
  }

  // Flatten all scheduled activities across all stops with their stop references
  const allActivitiesWithStop: {
    activity: StopActivityWithDetails;
    stop: StopWithDetails;
  }[] = [];

  stops.forEach((stop) => {
    (stop.stop_activities || []).forEach((sa) => {
      allActivitiesWithStop.push({
        activity: sa,
        stop,
      });
    });
  });

  // Build each DayPlan
  const days: DayPlan[] = [];

  for (let i = 0; i < totalDays; i++) {
    const currentDayNumber = i + 1;
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    const currentDateStr = formatToDateStr(currentDate);

    // Find corresponding stop for this date
    let matchingStop: StopWithDetails | undefined;

    // 1. Check if date falls in stop's arrival_date -> departure_date
    matchingStop = stops.find((s) => {
      if (!s.arrival_date || !s.departure_date) return false;
      const arr = parseLocalDate(s.arrival_date);
      const dep = parseLocalDate(s.departure_date);
      return currentDate >= arr && currentDate <= dep;
    });

    // 2. If not matched, divide stops chronologically across total days
    if (!matchingStop && stops.length > 0) {
      const stopIdx = Math.min(
        Math.floor((i / totalDays) * stops.length),
        stops.length - 1
      );
      matchingStop = stops[stopIdx];
    }

    // Filter activities scheduled on this dayNumber
    const dayActivities = allActivitiesWithStop
      .filter((item) => item.activity.day_number === currentDayNumber)
      .map((item) => item.activity)
      .sort((a, b) => {
        if (a.scheduled_time && b.scheduled_time) {
          return a.scheduled_time.localeCompare(b.scheduled_time);
        }
        if (a.scheduled_time) return -1;
        if (b.scheduled_time) return 1;
        return 0;
      });

    const totalDayCost = dayActivities.reduce((acc, act) => acc + (act.cost || 0), 0);

    days.push({
      dayNumber: currentDayNumber,
      dateStr: currentDateStr,
      formattedDate: formatReadableDate(currentDateStr),
      stop: matchingStop,
      city: matchingStop?.city,
      activities: dayActivities,
      totalDayCost,
      validationIssues: [],
    });
  }

  return days;
}
