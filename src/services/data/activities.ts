import { supabase } from "@/lib/supabase";
import type { Activity, ActivityFilters } from "@/types/database";

/**
 * Fetch activities with optional cityId and category/cost filters.
 */
export async function getActivities(
  cityId?: string,
  filters?: ActivityFilters
): Promise<Activity[]> {
  let query = supabase.from("activities").select("*");

  if (cityId) {
    query = query.eq("city_id", cityId);
  }

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.maxCost !== undefined) {
    query = query.lte("estimated_cost", filters.maxCost);
  }

  if (filters?.searchQuery?.trim()) {
    const term = `%${filters.searchQuery.trim()}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term}`);
  }

  switch (filters?.sortBy) {
    case "cost-asc":
      query = query.order("estimated_cost", { ascending: true });
      break;
    case "cost-desc":
      query = query.order("estimated_cost", { ascending: false });
      break;
    case "duration-asc":
      query = query.order("duration_hours", { ascending: true });
      break;
    case "title-asc":
      query = query.order("title", { ascending: true });
      break;
    default:
      query = query.order("estimated_cost", { ascending: true });
      break;
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Fetch a single activity by ID.
 */
export async function getActivity(id: string): Promise<Activity | null> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
}

/**
 * Fetch activities by category.
 */
export async function getActivitiesByCategory(
  category: string,
  cityId?: string
): Promise<Activity[]> {
  return getActivities(cityId, { category });
}

/**
 * Get distinct activity categories from the catalog.
 */
export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("category");

  if (error) throw error;
  const categories = Array.from(new Set((data || []).map((a) => a.category)));
  return categories.sort();
}
