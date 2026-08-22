import { supabase } from "@/lib/supabase";
import type {
  StopActivity,
  StopActivityInsert,
  StopActivityUpdate,
  StopActivityWithDetails,
} from "@/types/database";

/**
 * Fetch all scheduled activities for a specific stop, with full catalog activity details.
 */
export async function getStopActivities(stopId: string): Promise<StopActivityWithDetails[]> {
  const { data, error } = await supabase
    .from("stop_activities")
    .select(`
      *,
      activity:activities (*)
    `)
    .eq("stop_id", stopId)
    .order("day_number", { ascending: true })
    .order("scheduled_time", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return (data || []) as unknown as StopActivityWithDetails[];
}

/**
 * Fetch a single scheduled activity by ID.
 */
export async function getStopActivity(id: string): Promise<StopActivityWithDetails | null> {
  const { data, error } = await supabase
    .from("stop_activities")
    .select(`
      *,
      activity:activities (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as unknown as StopActivityWithDetails;
}

/**
 * Schedule a new activity inside a stop.
 */
export async function createStopActivity(
  activityData: StopActivityInsert
): Promise<StopActivity> {
  const { data, error } = await supabase
    .from("stop_activities")
    .insert(activityData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a scheduled stop activity.
 */
export async function updateStopActivity(
  id: string,
  updates: StopActivityUpdate
): Promise<StopActivity> {
  const { data, error } = await supabase
    .from("stop_activities")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a scheduled stop activity.
 */
export async function deleteStopActivity(id: string): Promise<void> {
  const { error } = await supabase
    .from("stop_activities")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/**
 * Toggle completion status of an activity.
 */
export async function toggleActivityCompleted(
  id: string,
  isCompleted: boolean
): Promise<StopActivity> {
  return updateStopActivity(id, { is_completed: isCompleted });
}
