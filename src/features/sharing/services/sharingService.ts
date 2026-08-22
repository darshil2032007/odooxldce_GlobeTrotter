import { supabase } from "@/lib/supabase";
import type { TripWithDetails } from "@/types/database";

/**
 * Generates a clean, URL-friendly share slug from a trip title.
 */
export function generateShareSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);

  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base || "trip"}-${randomSuffix}`;
}

/**
 * Enables public sharing for a trip and ensures it has a unique share slug.
 */
export async function enableTripSharing(
  tripId: string,
  existingSlug?: string | null
): Promise<{ shareSlug: string; shareUrl: string }> {
  let shareSlug = existingSlug;

  if (!shareSlug) {
    // Fetch title to make a clean slug
    const { data: trip } = await supabase
      .from("trips")
      .select("title")
      .eq("id", tripId)
      .single();

    shareSlug = generateShareSlug(trip?.title || "trip");
  }

  const { error } = await supabase
    .from("trips")
    .update({
      is_public: true,
      share_slug: shareSlug,
    })
    .eq("id", tripId);

  if (error) throw error;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/share/${shareSlug}`;

  return { shareSlug, shareUrl };
}

/**
 * Disables public sharing for a trip.
 */
export async function disableTripSharing(tripId: string): Promise<void> {
  const { error } = await supabase
    .from("trips")
    .update({ is_public: false })
    .eq("id", tripId);

  if (error) throw error;
}

/**
 * Public Trip Security:
 * Fetches a public trip by share slug ONLY if is_public === true.
 * Explicitly sanitizes and prevents exposing sensitive user info (emails, passwords, private user profiles).
 */
export async function getPublicTripBySlug(
  slug: string
): Promise<TripWithDetails | null> {
  const { data, error } = await supabase
    .from("trips")
    .select(`
      id,
      title,
      description,
      start_date,
      end_date,
      target_budget,
      cover_image_url,
      is_public,
      share_slug,
      created_at,
      updated_at,
      user_id,
      stops (
        id,
        trip_id,
        city_id,
        stop_order,
        arrival_date,
        departure_date,
        city:cities (
          id,
          name,
          country,
          region,
          image_url,
          cost_index,
          popularity_score
        ),
        stop_activities (
          id,
          stop_id,
          activity_id,
          day_number,
          scheduled_time,
          cost,
          notes,
          is_completed,
          activity:activities (
            id,
            city_id,
            title,
            description,
            category,
            estimated_cost,
            duration_hours,
            image_url
          )
        )
      )
    `)
    .eq("share_slug", slug)
    .eq("is_public", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found or not public
    throw error;
  }

  if (data?.stops) {
    // Sort stops and activities deterministically
    data.stops.sort(
      (a: { stop_order: number }, b: { stop_order: number }) =>
        a.stop_order - b.stop_order
    );
    data.stops.forEach((s: { stop_activities?: { day_number: number }[] }) => {
      s.stop_activities?.sort((a, b) => a.day_number - b.day_number);
    });
  }

  return data as unknown as TripWithDetails;
}
