import { supabase } from "@/lib/supabase";
import type {
  Stop,
  StopInsert,
  StopUpdate,
  StopWithDetails,
} from "@/types/database";

/**
 * Fetch all stops for a specific trip, ordered by stop_order.
 */
export async function getStops(tripId: string): Promise<StopWithDetails[]> {
  const { data, error } = await supabase
    .from("stops")
    .select(`
      *,
      city:cities (*),
      stop_activities (
        *,
        activity:activities (*)
      )
    `)
    .eq("trip_id", tripId)
    .order("stop_order", { ascending: true });

  if (error) throw error;

  const stops = (data || []) as unknown as StopWithDetails[];
  stops.forEach((s) => {
    s.stop_activities?.sort((a, b) => a.day_number - b.day_number);
  });

  return stops;
}

/**
 * Fetch a single stop by ID with its city and scheduled activities.
 */
export async function getStop(id: string): Promise<StopWithDetails | null> {
  const { data, error } = await supabase
    .from("stops")
    .select(`
      *,
      city:cities (*),
      stop_activities (
        *,
        activity:activities (*)
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  const stop = data as unknown as StopWithDetails;
  stop.stop_activities?.sort((a, b) => a.day_number - b.day_number);
  return stop;
}

/**
 * Create a new stop for a trip. Automatically calculates next stop_order if not provided.
 */
export async function createStop(stopData: StopInsert): Promise<Stop> {
  if (stopData.stop_order === undefined) {
    // Find current maximum stop_order
    const { data: existingStops } = await supabase
      .from("stops")
      .select("stop_order")
      .eq("trip_id", stopData.trip_id)
      .order("stop_order", { ascending: false })
      .limit(1);

    const maxOrder = existingStops?.[0]?.stop_order ?? -1;
    stopData.stop_order = maxOrder + 1;
  }

  const { data, error } = await supabase
    .from("stops")
    .insert(stopData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing stop.
 */
export async function updateStop(id: string, updates: StopUpdate): Promise<Stop> {
  const { data, error } = await supabase
    .from("stops")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a stop by ID.
 */
export async function deleteStop(id: string): Promise<void> {
  const { error } = await supabase.from("stops").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Batch reorder stops for an itinerary.
 */
export async function reorderStops(
  _tripId: string,
  stopOrders: { id: string; stop_order: number }[]
): Promise<void> {
  // Update each stop's order in parallel
  const updates = stopOrders.map(({ id, stop_order }) =>
    supabase.from("stops").update({ stop_order }).eq("id", id)
  );

  const results = await Promise.all(updates);
  for (const res of results) {
    if (res.error) throw res.error;
  }
}
