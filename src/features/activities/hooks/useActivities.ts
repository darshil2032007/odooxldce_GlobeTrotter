import { useQuery } from "@tanstack/react-query";
import { getActivities, getActivity, getCategories } from "@/services/data/activities";
import type { Activity, ActivityFilters } from "@/types/database";
import { FALLBACK_ACTIVITIES } from "../data/fallbackActivities";

/**
 * Filter fallback activities in-memory when Supabase is unreachable or empty.
 */
function filterFallbackActivities(cityId?: string, filters?: ActivityFilters): Activity[] {
  let result = [...FALLBACK_ACTIVITIES];

  if (cityId) {
    const cityMatches = result.filter((a) => a.city_id === cityId);
    if (cityMatches.length > 0) {
      result = cityMatches;
    }
  }

  if (filters?.category) {
    result = result.filter(
      (a) => a.category.toLowerCase() === filters.category!.toLowerCase()
    );
  }

  if (filters?.maxCost !== undefined) {
    result = result.filter((a) => a.estimated_cost <= filters.maxCost!);
  }

  if (filters?.searchQuery?.trim()) {
    const q = filters.searchQuery.trim().toLowerCase();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q))
    );
  }

  switch (filters?.sortBy) {
    case "cost-asc":
      result.sort((a, b) => a.estimated_cost - b.estimated_cost);
      break;
    case "cost-desc":
      result.sort((a, b) => b.estimated_cost - a.estimated_cost);
      break;
    case "duration-asc":
      result.sort((a, b) => a.duration_hours - b.duration_hours);
      break;
    case "title-asc":
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      result.sort((a, b) => a.estimated_cost - b.estimated_cost);
      break;
  }

  if (filters?.limit) {
    result = result.slice(0, filters.limit);
  }

  return result;
}

/**
 * Hook to query catalog activities for a specific city or global catalog.
 */
export function useActivities(cityId?: string, filters?: ActivityFilters) {
  return useQuery<Activity[]>({
    queryKey: ["activities", cityId, filters],
    queryFn: async () => {
      try {
        const data = await getActivities(cityId, filters);
        if (data && data.length > 0) return data;
        return filterFallbackActivities(cityId, filters);
      } catch (err) {
        console.warn("Falling back to local activity catalog:", err);
        return filterFallbackActivities(cityId, filters);
      }
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to get distinct activity categories.
 */
export function useCategories() {
  return useQuery<string[]>({
    queryKey: ["activity-categories"],
    queryFn: async () => {
      try {
        const data = await getCategories();
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn("Falling back to local categories:", err);
      }
      const unique = Array.from(new Set(FALLBACK_ACTIVITIES.map((a) => a.category)));
      return unique.sort();
    },
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Hook to fetch a single activity by ID.
 */
export function useActivity(activityId?: string) {
  return useQuery<Activity | null>({
    queryKey: ["activity", activityId],
    queryFn: async () => {
      if (!activityId) return null;
      try {
        const data = await getActivity(activityId);
        if (data) return data;
      } catch (err) {
        console.warn("Falling back to local activity item:", err);
      }
      return FALLBACK_ACTIVITIES.find((a) => a.id === activityId) || null;
    },
    enabled: !!activityId,
    staleTime: 1000 * 60 * 10,
  });
}
