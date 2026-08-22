import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TripCardData, CreateTripFormValues, BudgetSummary, TripStatus } from "@/types";
import { MOCK_TRIPS, MOCK_BUDGET_SUMMARY } from "@/lib/mock-data";
import { getTrips, getTrip, createTrip, deleteTrip } from "@/services/data/trips";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Maps a database Trip / TripWithDetails to UI TripCardData.
 */
function mapTripToCardData(trip: any): TripCardData {
  const today = new Date().toISOString().split("T")[0];
  let status: TripStatus = "upcoming";
  if (trip.end_date < today) {
    status = "completed";
  } else if (trip.start_date <= today && trip.end_date >= today) {
    status = "ongoing";
  }

  let budgetSpent = 0;
  if (trip.expenses && Array.isArray(trip.expenses)) {
    budgetSpent += trip.expenses.reduce(
      (acc: number, e: any) => acc + Number(e.amount || 0),
      0
    );
  }
  if (trip.stops && Array.isArray(trip.stops)) {
    trip.stops.forEach((s: any) => {
      if (s.stop_activities && Array.isArray(s.stop_activities)) {
        budgetSpent += s.stop_activities.reduce(
          (acc: number, sa: any) => acc + Number(sa.cost || 0),
          0
        );
      }
    });
  }

  const destinationCount =
    Array.isArray(trip.stops) && trip.stops.length > 0 ? trip.stops.length : 1;

  return {
    id: trip.id,
    name: trip.title,
    description: trip.description || undefined,
    startDate: trip.start_date,
    endDate: trip.end_date,
    coverImage: trip.cover_image_url || undefined,
    destinationCount,
    budgetTarget: Number(trip.target_budget || 0),
    budgetSpent,
    status,
    createdAt: trip.created_at || new Date().toISOString(),
  };
}

export function useTrips() {
  const { user } = useAuth();

  return useQuery<TripCardData[]>({
    queryKey: ["trips", user?.id],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return MOCK_TRIPS;
      }
      try {
        const data = await getTrips({ userId: user?.id });
        if (data && data.length > 0) {
          const detailsList = await Promise.all(
            data.map(async (t) => {
              try {
                const details = await getTrip(t.id);
                return details || t;
              } catch {
                return t;
              }
            })
          );
          return detailsList.map(mapTripToCardData);
        }
        return MOCK_TRIPS;
      } catch (err) {
        console.warn("Falling back to local trips:", err);
        return MOCK_TRIPS;
      }
    },
  });
}

export function useTrip(id: string) {
  return useQuery<TripCardData | undefined>({
    queryKey: ["trips", id],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return MOCK_TRIPS.find((t) => t.id === id);
      }
      try {
        const trip = await getTrip(id);
        if (trip) {
          return mapTripToCardData(trip);
        }
        return MOCK_TRIPS.find((t) => t.id === id);
      } catch (err) {
        console.warn("Falling back to local trip:", err);
        return MOCK_TRIPS.find((t) => t.id === id);
      }
    },
    enabled: !!id,
  });
}

export function useUpcomingTrips() {
  const query = useTrips();
  return {
    ...query,
    data: query.data?.filter(
      (t) => t.status === "upcoming" || t.status === "ongoing"
    ),
  };
}

export function useRecentTrips() {
  const query = useTrips();
  return {
    ...query,
    data: query.data?.filter((t) => t.status === "completed"),
  };
}

export function useBudgetSummary() {
  const { data: trips } = useTrips();

  return useQuery<BudgetSummary>({
    queryKey: [
      "budget",
      "summary",
      trips?.map((t) => `${t.id}-${t.budgetTarget}-${t.budgetSpent}`).join(","),
    ],
    queryFn: async () => {
      if (!trips || trips.length === 0) return MOCK_BUDGET_SUMMARY;
      const totalBudget = trips.reduce(
        (acc, t) => acc + (t.budgetTarget || 0),
        0
      );
      const totalSpent = trips.reduce(
        (acc, t) => acc + (t.budgetSpent || 0),
        0
      );
      return {
        totalBudget,
        totalSpent,
        totalRemaining: Math.max(0, totalBudget - totalSpent),
        tripCount: trips.length,
      };
    },
    enabled: true,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (values: CreateTripFormValues) => {
      if (isSupabaseConfigured && user?.id) {
        const created = await createTrip({
          user_id: user.id,
          title: values.name,
          description: values.description,
          start_date: values.startDate.toISOString().split("T")[0],
          end_date: values.endDate.toISOString().split("T")[0],
          target_budget: values.targetBudget,
          cover_image_url: values.coverImage || null,
        });
        return { id: created.id };
      }
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
    mutationFn: async (id: string) => {
      if (isSupabaseConfigured && !id.startsWith("trip-")) {
        await deleteTrip(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}
