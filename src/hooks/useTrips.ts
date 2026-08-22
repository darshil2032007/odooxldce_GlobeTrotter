import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TripCardData, CreateTripFormValues, BudgetSummary, TripStatus } from "@/types";
import { getTrips, getTrip, createTrip, deleteTrip, isValidUUID } from "@/services/data/trips";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  getStoredTrips,
  getStoredTrip,
  saveStoredTrip,
  deleteStoredTrip,
} from "@/lib/tripStore";
import type { TripWithDetails } from "@/types/database";

/**
 * Maps a database Trip / TripWithDetails to UI TripCardData.
 */
function mapTripToCardData(trip: TripWithDetails | any): TripCardData {
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
      if (isSupabaseConfigured) {
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
        } catch (err) {
          console.warn("Supabase trips query fallback to local store:", err);
        }
      }

      const localTrips = getStoredTrips();
      return localTrips.map(mapTripToCardData);
    },
  });
}

export function useTrip(id: string) {
  return useQuery<TripCardData | null>({
    queryKey: ["trip", id],
    queryFn: async () => {
      if (!id) return null;

      if (isSupabaseConfigured && isValidUUID(id)) {
        try {
          const remote = await getTrip(id);
          if (remote) {
            return mapTripToCardData(remote);
          }
        } catch (err) {
          console.warn("Supabase single trip query fallback to store:", err);
        }
      }

      const local = getStoredTrip(id);
      if (local) {
        return mapTripToCardData(local);
      }

      return null;
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
      if (!trips || trips.length === 0) {
        return {
          totalBudget: 0,
          totalSpent: 0,
          totalRemaining: 0,
          tripCount: 0,
        };
      }
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
      const tripPayload = {
        user_id: user?.id || "u0000000-0000-0000-0000-000000000001",
        title: values.name,
        description: values.description,
        start_date: values.startDate.toISOString().split("T")[0],
        end_date: values.endDate.toISOString().split("T")[0],
        target_budget: values.targetBudget,
        cover_image_url: values.coverImage || null,
        is_public: false,
      };

      if (isSupabaseConfigured && user?.id) {
        try {
          const created = await createTrip(tripPayload);
          saveStoredTrip({ ...tripPayload, id: created.id });
          return { id: created.id };
        } catch (err) {
          console.warn("Supabase trip creation fallback to store:", err);
        }
      }

      const saved = saveStoredTrip(tripPayload);
      return { id: saved.id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["trip", data.id] });
      queryClient.invalidateQueries({ queryKey: ["trip-details", data.id] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (isSupabaseConfigured) {
        try {
          await deleteTrip(id);
        } catch (err) {
          console.warn("Supabase delete trip fallback to store:", err);
        }
      }
      deleteStoredTrip(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}
