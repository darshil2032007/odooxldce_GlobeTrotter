import { supabase } from "@/lib/supabase";
import type { City, CityFilters } from "@/types/database";

/**
 * Fetch cities with optional filtering, search, and sorting.
 */
export async function getCities(filters?: CityFilters): Promise<City[]> {
  let query = supabase.from("cities").select("*");

  if (filters?.searchQuery?.trim()) {
    const term = `%${filters.searchQuery.trim()}%`;
    query = query.or(`name.ilike.${term},country.ilike.${term}`);
  }

  if (filters?.country) {
    query = query.eq("country", filters.country);
  }

  if (filters?.region) {
    query = query.eq("region", filters.region);
  }

  if (filters?.minPopularity !== undefined) {
    query = query.gte("popularity_score", filters.minPopularity);
  }

  if (filters?.maxCostIndex !== undefined) {
    query = query.lte("cost_index", filters.maxCostIndex);
  }

  switch (filters?.sortBy) {
    case "cost-asc":
      query = query.order("cost_index", { ascending: true });
      break;
    case "cost-desc":
      query = query.order("cost_index", { ascending: false });
      break;
    case "name-asc":
      query = query.order("name", { ascending: true });
      break;
    case "popularity-desc":
    default:
      query = query.order("popularity_score", { ascending: false });
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
 * Fetch a single city by ID with its curated activities.
 */
export async function getCity(id: string) {
  const { data, error } = await supabase
    .from("cities")
    .select(`
      *,
      activities (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
}

/**
 * Fetch top popular destinations for discovery and landing pages.
 */
export async function getPopularCities(limit: number = 6): Promise<City[]> {
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .order("popularity_score", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Fast search for city autocomplete dropdowns.
 */
export async function searchCities(searchTerm: string, limit: number = 8): Promise<City[]> {
  if (!searchTerm || !searchTerm.trim()) {
    return getPopularCities(limit);
  }

  const term = `%${searchTerm.trim()}%`;
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .or(`name.ilike.${term},country.ilike.${term}`)
    .order("popularity_score", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
