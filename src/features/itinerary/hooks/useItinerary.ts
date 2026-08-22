import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTrip } from "@/services/data/trips";
import {
  createStop,
  updateStop,
  deleteStop,
  reorderStops,
} from "@/services/data/stops";
import {
  createStopActivity,
  updateStopActivity,
  deleteStopActivity,
  toggleActivityCompleted,
} from "@/services/data/stopActivities";
import type {
  TripWithDetails,
  StopWithDetails,
  StopInsert,
  StopUpdate,
  StopActivityInsert,
  StopActivityUpdate,
  StopActivityWithDetails,
} from "@/types/database";
import {
  getStoredTrip,
  addStoredStop,
  updateStoredStop,
  deleteStoredStop,
  reorderStoredStops,
  addStoredStopActivity,
  updateStoredStopActivity,
  deleteStoredStopActivity,
} from "@/lib/tripStore";
import { FALLBACK_CITIES } from "@/features/cities/data/fallbackCities";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Hook to fetch the complete Itinerary for a trip (TripWithDetails).
 */
export function useTripDetails(tripId: string) {
  return useQuery<TripWithDetails>({
    queryKey: ["trip-details", tripId],
    queryFn: async () => {
      if (!tripId) throw new Error("Trip ID is required");

      // 1. If Supabase is configured, try fetching remote
      if (isSupabaseConfigured) {
        try {
          const remoteData = await getTrip(tripId);
          if (remoteData) {
            return remoteData;
          }
        } catch (err) {
          console.warn("Supabase trip details fetch fallback:", err);
        }
      }

      // 2. Fallback to centralized local store
      const localTrip = getStoredTrip(tripId);
      if (localTrip) {
        return localTrip;
      }

      // 3. If totally unknown ID, return default stored trip
      const firstStored = getStoredTrip("t0000000-0000-0000-0000-000000000001");
      if (firstStored) {
        return { ...firstStored, id: tripId, title: firstStored.title };
      }

      throw new Error(`Trip ${tripId} not found`);
    },
    enabled: !!tripId,
    staleTime: 1000 * 10,
  });
}

/**
 * Hook to create a new Stop for a trip.
 */
export function useCreateStop(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stopData: StopInsert) => {
      // 1. Try Supabase if configured
      if (isSupabaseConfigured) {
        try {
          const created = await createStop(stopData);
          try {
            addStoredStop({ ...stopData, id: created.id });
          } catch {
            // Local store sync silent
          }
          return created;
        } catch (err) {
          console.warn("Supabase stop creation fallback to store:", err);
        }
      }

      // 2. Local store insertion
      return addStoredStop(stopData);
    },
    onSuccess: (newStop) => {
      queryClient.setQueryData<TripWithDetails>(
        ["trip-details", tripId],
        (old) => {
          if (!old) return old;
          const resolvedCity =
            (newStop as any).city ||
            FALLBACK_CITIES.find((c) => c.id === newStop.city_id) ||
            FALLBACK_CITIES[0];

          const stopWithDetails: StopWithDetails = {
            ...newStop,
            city: resolvedCity,
            stop_activities: (newStop as any).stop_activities || [],
          };
          const updatedStops = [...old.stops, stopWithDetails].sort(
            (a, b) => a.stop_order - b.stop_order
          );
          return { ...old, stops: updatedStops };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["trip-details", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

/**
 * Hook to update an existing Stop.
 */
export function useUpdateStop(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: StopUpdate;
    }) => {
      if (isSupabaseConfigured) {
        try {
          await updateStop(id, updates);
        } catch (err) {
          console.warn("Supabase stop update fallback to store:", err);
        }
      }
      updateStoredStop(id, updates);
      return { id, ...updates };
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<TripWithDetails>(
        ["trip-details", tripId],
        (old) => {
          if (!old) return old;
          const updatedStops = old.stops.map((s) =>
            s.id === variables.id ? { ...s, ...variables.updates } : s
          );
          return { ...old, stops: updatedStops };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["trip-details", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
    },
  });
}

/**
 * Hook to delete a Stop from a trip.
 */
export function useDeleteStop(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stopId: string) => {
      if (isSupabaseConfigured) {
        try {
          await deleteStop(stopId);
        } catch (err) {
          console.warn("Supabase stop delete fallback to store:", err);
        }
      }
      deleteStoredStop(stopId);
      return stopId;
    },
    onSuccess: (deletedStopId) => {
      queryClient.setQueryData<TripWithDetails>(
        ["trip-details", tripId],
        (old) => {
          if (!old) return old;
          const updatedStops = old.stops
            .filter((s) => s.id !== deletedStopId)
            .map((s, idx) => ({ ...s, stop_order: idx }));
          return { ...old, stops: updatedStops };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["trip-details", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

/**
 * Hook to reorder Stops (Move Up / Move Down).
 */
export function useReorderStops(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      orderedStops: { id: string; stop_order: number }[]
    ) => {
      if (isSupabaseConfigured) {
        try {
          await reorderStops(tripId, orderedStops);
        } catch (err) {
          console.warn("Supabase reorder stops fallback to store:", err);
        }
      }
      reorderStoredStops(tripId, orderedStops);
    },
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ["trip-details", tripId] });
      const previousTrip = queryClient.getQueryData<TripWithDetails>([
        "trip-details",
        tripId,
      ]);

      if (previousTrip) {
        const orderMap = new Map(newOrder.map((o) => [o.id, o.stop_order]));
        const reordered = [...previousTrip.stops].sort((a, b) => {
          const ordA = orderMap.get(a.id) ?? a.stop_order;
          const ordB = orderMap.get(b.id) ?? b.stop_order;
          return ordA - ordB;
        });
        queryClient.setQueryData<TripWithDetails>(
          ["trip-details", tripId],
          { ...previousTrip, stops: reordered }
        );
      }
      return { previousTrip };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-details", tripId] });
    },
  });
}

/**
 * Hook to create a StopActivity (schedule activity to a day).
 */
export function useCreateStopActivity(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StopActivityInsert) => {
      if (isSupabaseConfigured) {
        try {
          const created = await createStopActivity(data);
          try {
            addStoredStopActivity({ ...data, id: created.id });
          } catch {
            // Local store sync silent
          }
          return created;
        } catch (err) {
          console.warn("Supabase stop activity creation fallback to store:", err);
        }
      }
      return addStoredStopActivity(data);
    },
    onSuccess: (newActivity) => {
      queryClient.setQueryData<TripWithDetails>(
        ["trip-details", tripId],
        (old) => {
          if (!old) return old;
          const fullAct = {
            ...newActivity,
            activity: ('activity' in newActivity ? newActivity.activity : null) as StopActivityWithDetails['activity'],
          };
          const updatedStops = old.stops.map((s) => {
            if (s.id === newActivity.stop_id) {
              const currentActs = s.stop_activities || [];
              const exists = currentActs.some((a) => a.id === newActivity.id);
              return {
                ...s,
                stop_activities: exists
                  ? currentActs.map((a) => (a.id === newActivity.id ? fullAct : a))
                  : [...currentActs, fullAct],
              };
            }
            return s;
          });
          return { ...old, stops: updatedStops };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["trip-details", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

/**
 * Hook to update a StopActivity (change time, day, notes, cost).
 */
export function useUpdateStopActivity(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: StopActivityUpdate;
    }) => {
      if (isSupabaseConfigured) {
        try {
          await updateStopActivity(id, updates);
        } catch (err) {
          console.warn("Supabase stop activity update fallback to store:", err);
        }
      }
      updateStoredStopActivity(id, updates);
      return { id, ...updates };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<TripWithDetails>(
        ["trip-details", tripId],
        (old) => {
          if (!old) return old;
          const updatedStops = old.stops.map((s) => ({
            ...s,
            stop_activities: (s.stop_activities || []).map((a) =>
              a.id === updated.id ? { ...a, ...updated } : a
            ),
          }));
          return { ...old, stops: updatedStops };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["trip-details", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

/**
 * Hook to delete a StopActivity.
 */
export function useDeleteStopActivity(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (isSupabaseConfigured) {
        try {
          await deleteStopActivity(id);
        } catch (err) {
          console.warn("Supabase stop activity delete fallback to store:", err);
        }
      }
      deleteStoredStopActivity(id);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<TripWithDetails>(
        ["trip-details", tripId],
        (old) => {
          if (!old) return old;
          const updatedStops = old.stops.map((s) => ({
            ...s,
            stop_activities: (s.stop_activities || []).filter((a) => a.id !== deletedId),
          }));
          return { ...old, stops: updatedStops };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["trip-details", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

/**
 * Hook to toggle activity completion.
 */
export function useToggleActivityCompleted(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isCompleted,
    }: {
      id: string;
      isCompleted: boolean;
    }) => {
      if (isSupabaseConfigured) {
        try {
          await toggleActivityCompleted(id, isCompleted);
        } catch (err) {
          console.warn("Supabase toggle activity fallback to store:", err);
        }
      }
      updateStoredStopActivity(id, { is_completed: isCompleted });
      return { id, is_completed: isCompleted };
    },
    onSuccess: (res) => {
      queryClient.setQueryData<TripWithDetails>(
        ["trip-details", tripId],
        (old) => {
          if (!old) return old;
          const updatedStops = old.stops.map((s) => ({
            ...s,
            stop_activities: (s.stop_activities || []).map((a) =>
              a.id === res.id ? { ...a, is_completed: res.is_completed } : a
            ),
          }));
          return { ...old, stops: updatedStops };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["trip-details", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}
