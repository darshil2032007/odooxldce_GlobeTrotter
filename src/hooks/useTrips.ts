import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TripCardData, CreateTripFormValues, BudgetSummary } from "@/types";
import { MOCK_TRIPS, MOCK_BUDGET_SUMMARY } from "@/lib/mock-data";

/**
 * TanStack Query hooks for trip data.
 *
 * TODO: Replace mock implementations with real Supabase queries
 * once Developer 2 provides the data layer.
 *
 * The hook signatures and return types form the contract
 * between the UI and the data layer.
 */

// Simulate network delay for realistic loading states
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useTrips() {
  return useQuery<TripCardData[]>({
    queryKey: ["trips"],
    queryFn: async () => {
      // TODO: Replace with supabase.from('trips').select(...)
      await delay(800);
      return MOCK_TRIPS;
    },
  });
}

export function useTrip(id: string) {
  return useQuery<TripCardData | undefined>({
    queryKey: ["trips", id],
    queryFn: async () => {
      // TODO: Replace with supabase.from('trips').select(...).eq('id', id).single()
      await delay(500);
      return MOCK_TRIPS.find((t) => t.id === id);
    },
    enabled: !!id,
  });
}

export function useUpcomingTrips() {
  return useQuery<TripCardData[]>({
    queryKey: ["trips", "upcoming"],
    queryFn: async () => {
      await delay(600);
      return MOCK_TRIPS.filter((t) => t.status === "upcoming");
    },
  });
}

export function useRecentTrips() {
  return useQuery<TripCardData[]>({
    queryKey: ["trips", "recent"],
    queryFn: async () => {
      await delay(600);
      return MOCK_TRIPS.filter(
        (t) => t.status === "completed" || t.status === "ongoing"
      );
    },
  });
}

export function useBudgetSummary() {
  return useQuery<BudgetSummary>({
    queryKey: ["budget", "summary"],
    queryFn: async () => {
      await delay(500);
      return MOCK_BUDGET_SUMMARY;
    },
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_values: CreateTripFormValues) => {
      // TODO: Replace with supabase.from('trips').insert(...)
      await delay(1000);
      return { id: `trip-${Date.now()}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_id: string) => {
      // TODO: Replace with supabase.from('trips').delete().eq('id', id)
      await delay(500);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}
