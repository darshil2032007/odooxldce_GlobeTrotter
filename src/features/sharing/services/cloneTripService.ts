import { supabase } from "@/lib/supabase";
import { getTrip } from "@/services/data/trips";
import type { TripWithDetails } from "@/types/database";

/**
 * Clones a trip along with all its stops and scheduled activities into the target user's account.
 *
 * @param sourceTripOrId Source TripWithDetails object or Trip ID
 * @param targetUserId User ID of the logged in user who is cloning the trip
 * @param customTitle Optional custom title for the new trip
 * @returns ID of the newly created trip
 */
export async function cloneTrip(
  sourceTripOrId: TripWithDetails | string,
  targetUserId: string,
  customTitle?: string
): Promise<string> {
  let sourceTrip: TripWithDetails | null = null;

  if (typeof sourceTripOrId === "string") {
    sourceTrip = await getTrip(sourceTripOrId);
  } else {
    sourceTrip = sourceTripOrId;
  }

  if (!sourceTrip) {
    throw new Error("Source trip not found to clone");
  }

  const title =
    customTitle ||
    (sourceTrip.title.startsWith("Copy of ")
      ? sourceTrip.title
      : `Copy of ${sourceTrip.title}`);

  // 1. Create cloned trip row
  const { data: newTrip, error: tripError } = await supabase
    .from("trips")
    .insert({
      user_id: targetUserId,
      title,
      description: sourceTrip.description,
      start_date: sourceTrip.start_date,
      end_date: sourceTrip.end_date,
      target_budget: sourceTrip.target_budget,
      cover_image_url: sourceTrip.cover_image_url,
      is_public: false,
      share_slug: null,
    })
    .select()
    .single();

  if (tripError) throw tripError;

  const newTripId = newTrip.id;

  // 2. Clone stops and their scheduled activities in order
  const stops = sourceTrip.stops || [];
  for (const stop of stops) {
    const { data: newStop, error: stopError } = await supabase
      .from("stops")
      .insert({
        trip_id: newTripId,
        city_id: stop.city_id,
        stop_order: stop.stop_order,
        arrival_date: stop.arrival_date,
        departure_date: stop.departure_date,
      })
      .select()
      .single();

    if (stopError) throw stopError;

    // Clone stop activities
    const stopActivities = stop.stop_activities || [];
    if (stopActivities.length > 0) {
      const activitiesToInsert = stopActivities.map((sa) => ({
        stop_id: newStop.id,
        activity_id: sa.activity_id,
        day_number: sa.day_number,
        scheduled_time: sa.scheduled_time,
        cost: sa.cost,
        notes: sa.notes,
        is_completed: false, // Reset completion status for cloned trip
      }));

      const { error: actError } = await supabase
        .from("stop_activities")
        .insert(activitiesToInsert);

      if (actError) throw actError;
    }
  }

  return newTripId;
}
