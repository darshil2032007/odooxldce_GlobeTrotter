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
  StopInsert,
  StopUpdate,
  StopActivityInsert,
  StopActivityUpdate,
} from "@/types/database";
import { FALLBACK_CITIES } from "@/features/cities/data/fallbackCities";
import { FALLBACK_ACTIVITIES } from "@/features/activities/data/fallbackActivities";

/**
 * Generate fallback trip data with stops and activities if database is not yet seeded or offline.
 */
function createFallbackTripDetails(tripId: string): TripWithDetails {
  const mumbai = FALLBACK_CITIES[1]; // Mumbai
  const goa = FALLBACK_CITIES[2]; // Goa

  const stop1Id = `stop-fallback-1-${tripId}`;
  const stop2Id = `stop-fallback-2-${tripId}`;

  const mumbaiActs = FALLBACK_ACTIVITIES.filter((a) => a.city_id === mumbai.id);
  const goaActs = FALLBACK_ACTIVITIES.filter((a) => a.city_id === goa.id);

  return {
    id: tripId,
    user_id: "user-mock-1",
    title: "India Coastal Journey: Mumbai to Goa",
    description: "A breathtaking journey exploring the historic architecture of Mumbai and the sun-soaked golden beaches of Goa.",
    start_date: "2026-09-10",
    end_date: "2026-09-18",
    target_budget: 3500,
    cover_image_url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
    is_public: true,
    share_slug: `trip-${tripId}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stops: [
      {
        id: stop1Id,
        trip_id: tripId,
        city_id: mumbai.id,
        stop_order: 0,
        arrival_date: "2026-09-10",
        departure_date: "2026-09-13",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        city: mumbai,
        stop_activities: [
          {
            id: "sa-1",
            stop_id: stop1Id,
            activity_id: mumbaiActs[0]?.id || null,
            day_number: 1,
            scheduled_time: "09:00",
            cost: mumbaiActs[0]?.estimated_cost ?? 15,
            notes: "Meeting at Apollo Bunder gate. Take the 9:30 AM ferry.",
            is_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            activity: mumbaiActs[0] || null,
          },
          {
            id: "sa-2",
            stop_id: stop1Id,
            activity_id: mumbaiActs[2]?.id || null,
            day_number: 1,
            scheduled_time: "13:00",
            cost: mumbaiActs[2]?.estimated_cost ?? 18,
            notes: "Lunch at Britannia & Co. Try the berry pulao and iced chai.",
            is_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            activity: mumbaiActs[2] || null,
          },
          {
            id: "sa-3",
            stop_id: stop1Id,
            activity_id: mumbaiActs[1]?.id || null,
            day_number: 1,
            scheduled_time: "17:30",
            cost: mumbaiActs[1]?.estimated_cost ?? 0,
            notes: "Catch the sunset over the Arabian Sea promenade.",
            is_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            activity: mumbaiActs[1] || null,
          },
        ],
      },
      {
        id: stop2Id,
        trip_id: tripId,
        city_id: goa.id,
        stop_order: 1,
        arrival_date: "2026-09-13",
        departure_date: "2026-09-18",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        city: goa,
        stop_activities: [
          {
            id: "sa-4",
            stop_id: stop2Id,
            activity_id: goaActs[2]?.id || null,
            day_number: 4,
            scheduled_time: "10:00",
            cost: goaActs[2]?.estimated_cost ?? 8,
            notes: "Walk through pastel Portuguese villas in Panaji.",
            is_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            activity: goaActs[2] || null,
          },
          {
            id: "sa-5",
            stop_id: stop2Id,
            activity_id: goaActs[3]?.id || null,
            day_number: 4,
            scheduled_time: "15:30",
            cost: goaActs[3]?.estimated_cost ?? 20,
            notes: "Kayak into Palolem sea caves and spot dolphins.",
            is_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            activity: goaActs[3] || null,
          },
          {
            id: "sa-6",
            stop_id: stop2Id,
            activity_id: goaActs[1]?.id || null,
            day_number: 5,
            scheduled_time: "08:30",
            cost: goaActs[1]?.estimated_cost ?? 35,
            notes: "Jeep safari to the 4-tiered waterfalls.",
            is_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            activity: goaActs[1] || null,
          },
        ],
      },
    ],
  };
}

/**
 * Hook to fetch the complete Itinerary for a trip (TripWithDetails).
 */
export function useTripDetails(tripId: string) {
  return useQuery<TripWithDetails>({
    queryKey: ["trip-details", tripId],
    queryFn: async () => {
      try {
        const data = await getTrip(tripId);
        if (data) {
          return data;
        }
        return createFallbackTripDetails(tripId);
      } catch (err) {
        console.warn("Falling back to local trip details:", err);
        return createFallbackTripDetails(tripId);
      }
    },
    enabled: !!tripId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to create a new Stop for a trip.
 */
export function useCreateStop(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stopData: StopInsert) => {
      try {
        return await createStop(stopData);
      } catch (err) {
        console.warn("Local stop creation fallback:", err);
        // Optimistic local response
        const city = FALLBACK_CITIES.find((c) => c.id === stopData.city_id);
        return {
          id: `stop-${Date.now()}`,
          trip_id: tripId,
          city_id: stopData.city_id,
          stop_order: stopData.stop_order ?? 0,
          arrival_date: stopData.arrival_date ?? null,
          departure_date: stopData.departure_date ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          city,
        };
      }
    },
    onSuccess: (newStop) => {
      queryClient.setQueryData<TripWithDetails>(
        ["trip-details", tripId],
        (old) => {
          if (!old) return old;
          const city = FALLBACK_CITIES.find((c) => c.id === newStop.city_id);
          const stopWithDetails = {
            ...newStop,
            city: city || old.stops[0]?.city,
            stop_activities: [],
          };
          const updatedStops = [...old.stops, stopWithDetails].sort(
            (a, b) => a.stop_order - b.stop_order
          );
          return { ...old, stops: updatedStops };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["trip-details", tripId] });
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
      try {
        return await updateStop(id, updates);
      } catch (err) {
        console.warn("Local stop update fallback:", err);
        return { id, ...updates };
      }
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
      try {
        await deleteStop(stopId);
      } catch (err) {
        console.warn("Local stop delete fallback:", err);
      }
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
      try {
        await reorderStops(tripId, orderedStops);
      } catch (err) {
        console.warn("Local stop reorder fallback:", err);
      }
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
      try {
        const created = await createStopActivity(data);
        return created;
      } catch (err) {
        console.warn("Local stop activity creation fallback:", err);
        const act = FALLBACK_ACTIVITIES.find((a) => a.id === data.activity_id);
        return {
          id: `sa-${Date.now()}`,
          stop_id: data.stop_id,
          activity_id: data.activity_id ?? null,
          day_number: data.day_number ?? 1,
          scheduled_time: data.scheduled_time ?? null,
          cost: data.cost ?? 0,
          notes: data.notes ?? null,
          is_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          activity: act || null,
        };
      }
    },
    onSuccess: (newActivity) => {
      queryClient.setQueryData<TripWithDetails>(
        ["trip-details", tripId],
        (old) => {
          if (!old) return old;
          const act = FALLBACK_ACTIVITIES.find((a) => a.id === newActivity.activity_id);
          const fullAct = {
            ...newActivity,
            activity: act || null,
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
      try {
        return await updateStopActivity(id, updates);
      } catch (err) {
        console.warn("Local stop activity update fallback:", err);
        return { id, ...updates };
      }
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
      try {
        await deleteStopActivity(id);
      } catch (err) {
        console.warn("Local stop activity delete fallback:", err);
      }
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
      try {
        return await toggleActivityCompleted(id, isCompleted);
      } catch (err) {
        console.warn("Local toggle fallback:", err);
        return { id, is_completed: isCompleted };
      }
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
    },
  });
}
