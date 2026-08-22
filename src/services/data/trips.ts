import { supabase } from "@/lib/supabase";
import type {
  Trip,
  TripInsert,
  TripUpdate,
  TripWithDetails,
  TripFilters,
} from "@/types/database";

/**
 * Fetch all trips accessible to current user with optional filtering & sorting.
 */
export async function getTrips(filters?: TripFilters): Promise<Trip[]> {
  let query = supabase.from("trips").select("*");

  if (filters?.userId) {
    query = query.eq("user_id", filters.userId);
  }

  if (typeof filters?.isPublic === "boolean") {
    query = query.eq("is_public", filters.isPublic);
  }

  if (filters?.searchQuery?.trim()) {
    const term = `%${filters.searchQuery.trim()}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term}`);
  }

  // Sorting
  switch (filters?.sortBy) {
    case "date-asc":
      query = query.order("start_date", { ascending: true });
      break;
    case "date-desc":
      query = query.order("start_date", { ascending: false });
      break;
    case "budget-desc":
      query = query.order("target_budget", { ascending: false });
      break;
    case "name-asc":
      query = query.order("title", { ascending: true });
      break;
    case "created-desc":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Fetch a single trip by ID with all stops, cities, and scheduled activities.
 */
export async function getTrip(id: string): Promise<TripWithDetails | null> {
  const { data, error } = await supabase
    .from("trips")
    .select(`
      *,
      stops (
        *,
        city:cities (*),
        stop_activities (
          *,
          activity:activities (*)
        )
      ),
      expenses (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Row not found
    throw error;
  }

  // Sort stops by stop_order and stop_activities by day_number
  if (data?.stops) {
    data.stops.sort((a: { stop_order: number }, b: { stop_order: number }) => a.stop_order - b.stop_order);
    data.stops.forEach((s: { stop_activities?: { day_number: number }[] }) => {
      s.stop_activities?.sort((a, b) => a.day_number - b.day_number);
    });
  }

  return data as unknown as TripWithDetails;
}

/**
 * Fetch a public trip by its unique share slug.
 */
export async function getTripBySlug(slug: string): Promise<TripWithDetails | null> {
  const { data, error } = await supabase
    .from("trips")
    .select(`
      *,
      stops (
        *,
        city:cities (*),
        stop_activities (
          *,
          activity:activities (*)
        )
      )
    `)
    .eq("share_slug", slug)
    .eq("is_public", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  if (data?.stops) {
    data.stops.sort((a: { stop_order: number }, b: { stop_order: number }) => a.stop_order - b.stop_order);
  }

  return data as unknown as TripWithDetails;
}

/**
 * Create a new trip.
 */
export async function createTrip(tripData: TripInsert): Promise<Trip> {
  const { data, error } = await supabase
    .from("trips")
    .insert(tripData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing trip by ID.
 */
export async function updateTrip(id: string, tripUpdates: TripUpdate): Promise<Trip> {
  const { data, error } = await supabase
    .from("trips")
    .update(tripUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a trip by ID.
 */
export async function deleteTrip(id: string): Promise<void> {
  const { error } = await supabase.from("trips").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Fetch public trips for community exploration / discovery.
 */
export async function getPublicTrips(limit: number = 10): Promise<Trip[]> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Fetch upcoming trips for current user.
 */
export async function getUpcomingTrips(userId?: string): Promise<Trip[]> {
  const today = new Date().toISOString().split("T")[0];
  let query = supabase
    .from("trips")
    .select("*")
    .gte("start_date", today)
    .order("start_date", { ascending: true });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Fetch recent or past trips.
 */
export async function getRecentTrips(userId?: string): Promise<Trip[]> {
  let query = supabase
    .from("trips")
    .select("*")
    .order("start_date", { ascending: false })
    .limit(5);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
