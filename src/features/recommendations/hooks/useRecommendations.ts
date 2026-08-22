import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCities } from "@/services/data/cities";
import { getActivities } from "@/services/data/activities";
import { rankDestinations } from "../engine/scoringEngine";
import type { UserPreferences, ScoredDestination } from "../types";

export function useRecommendations(initialPrefs?: Partial<UserPreferences>) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    targetBudget: initialPrefs?.targetBudget ?? 45000,
    durationDays: initialPrefs?.durationDays ?? 5,
    interests: initialPrefs?.interests ?? ["Culture", "Adventure"],
    travelStyle: initialPrefs?.travelStyle ?? "moderate",
  });

  const { data: cities = [], isLoading: loadingCities } = useQuery({
    queryKey: ["recommendations", "cities"],
    queryFn: async () => {
      return await getCities();
    },
  });

  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ["recommendations", "activities"],
    queryFn: async () => {
      return await getActivities();
    },
  });

  const rankedDestinations = useMemo<ScoredDestination[]>(() => {
    if (cities.length === 0) return [];
    return rankDestinations(cities, activities, preferences);
  }, [cities, activities, preferences]);

  return {
    preferences,
    setPreferences,
    rankedDestinations,
    isLoading: loadingCities || loadingActivities,
  };
}
