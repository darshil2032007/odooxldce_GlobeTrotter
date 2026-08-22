import { useQuery } from "@tanstack/react-query";
import { getCities, getCity, getPopularCities, searchCities } from "@/services/data/cities";
import type { City, CityFilters } from "@/types/database";
import { FALLBACK_CITIES } from "../data/fallbackCities";

/**
 * Filter fallback cities in-memory when Supabase is empty or unreachable.
 */
function filterFallbackCities(filters?: CityFilters): City[] {
  let result = [...FALLBACK_CITIES];

  if (filters?.searchQuery?.trim()) {
    const q = filters.searchQuery.trim().toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        (c.region && c.region.toLowerCase().includes(q))
    );
  }

  if (filters?.country) {
    result = result.filter(
      (c) => c.country.toLowerCase() === filters.country!.toLowerCase()
    );
  }

  if (filters?.region) {
    result = result.filter(
      (c) => c.region?.toLowerCase() === filters.region!.toLowerCase()
    );
  }

  if (filters?.maxCostIndex !== undefined) {
    result = result.filter((c) => c.cost_index <= filters.maxCostIndex!);
  }

  if (filters?.minPopularity !== undefined) {
    result = result.filter((c) => c.popularity_score >= filters.minPopularity!);
  }

  switch (filters?.sortBy) {
    case "cost-asc":
      result.sort((a, b) => a.cost_index - b.cost_index);
      break;
    case "cost-desc":
      result.sort((a, b) => b.cost_index - a.cost_index);
      break;
    case "name-asc":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "popularity-desc":
    default:
      result.sort((a, b) => b.popularity_score - a.popularity_score);
      break;
  }

  if (filters?.limit) {
    result = result.slice(0, filters.limit);
  }

  return result;
}

/**
 * Hook to fetch cities with optional filters, search query, and sorting.
 */
export function useCities(filters?: CityFilters) {
  return useQuery<City[]>({
    queryKey: ["cities", filters],
    queryFn: async () => {
      try {
        const data = await getCities(filters);
        if (data && data.length > 0) {
          return data;
        }
        return filterFallbackCities(filters);
      } catch (err) {
        console.warn("Falling back to local city catalog:", err);
        return filterFallbackCities(filters);
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
}

/**
 * Hook to fetch top popular cities.
 */
export function usePopularCities(limit: number = 6) {
  return useQuery<City[]>({
    queryKey: ["cities", "popular", limit],
    queryFn: async () => {
      try {
        const data = await getPopularCities(limit);
        if (data && data.length > 0) return data;
        return FALLBACK_CITIES.slice(0, limit);
      } catch (err) {
        console.warn("Falling back to local popular cities:", err);
        return FALLBACK_CITIES.slice(0, limit);
      }
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to search cities with autocomplete query.
 */
export function useCitySearch(searchTerm: string, limit: number = 8) {
  return useQuery<City[]>({
    queryKey: ["cities", "search", searchTerm, limit],
    queryFn: async () => {
      try {
        const data = await searchCities(searchTerm, limit);
        if (data && data.length > 0) return data;
        return filterFallbackCities({ searchQuery: searchTerm, limit });
      } catch (err) {
        console.warn("Falling back to local city search:", err);
        return filterFallbackCities({ searchQuery: searchTerm, limit });
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch a single city by ID.
 */
export function useCity(cityId?: string) {
  return useQuery<City | null>({
    queryKey: ["city", cityId],
    queryFn: async () => {
      if (!cityId) return null;
      try {
        const data = await getCity(cityId);
        if (data) return data;
        return FALLBACK_CITIES.find((c) => c.id === cityId) || null;
      } catch (err) {
        console.warn("Falling back to local city item:", err);
        return FALLBACK_CITIES.find((c) => c.id === cityId) || null;
      }
    },
    enabled: !!cityId,
    staleTime: 1000 * 60 * 10,
  });
}
