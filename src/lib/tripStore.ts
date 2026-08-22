import type {
  TripWithDetails,
  StopWithDetails,
  StopActivityWithDetails,
  City,
  TripInsert,
  StopInsert,
  StopUpdate,
  StopActivityInsert,
  StopActivityUpdate,
  Expense,
  ExpenseInsert,
} from "@/types/database";
import { FALLBACK_CITIES } from "@/features/cities/data/fallbackCities";
import { FALLBACK_ACTIVITIES } from "@/features/activities/data/fallbackActivities";

const STORAGE_KEY = "globetrotter_trips_store_v1";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Default seeded trips matching verified catalog cities and activities.
 */
function createInitialTrips(): TripWithDetails[] {
  const delhi = FALLBACK_CITIES.find((c) => c.name === "Delhi") || FALLBACK_CITIES[4];
  const jaipur = FALLBACK_CITIES.find((c) => c.name === "Jaipur") || FALLBACK_CITIES[5];
  const goa = FALLBACK_CITIES.find((c) => c.name === "Goa") || FALLBACK_CITIES[2];
  const ahmedabad = FALLBACK_CITIES.find((c) => c.name === "Ahmedabad") || FALLBACK_CITIES[0];
  const mumbai = FALLBACK_CITIES.find((c) => c.name === "Mumbai") || FALLBACK_CITIES[1];

  const actDelhi = FALLBACK_ACTIVITIES.filter((a) => a.city_id === delhi.id);
  const actJaipur = FALLBACK_ACTIVITIES.filter((a) => a.city_id === jaipur.id);
  const actGoa = FALLBACK_ACTIVITIES.filter((a) => a.city_id === goa.id);
  const actAhm = FALLBACK_ACTIVITIES.filter((a) => a.city_id === ahmedabad.id);
  const actMum = FALLBACK_ACTIVITIES.filter((a) => a.city_id === mumbai.id);

  const now = new Date();
  const formatOffsetDate = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const trip1Id = "t0000000-0000-0000-0000-000000000001";
  const t1Stop1Id = "s0000000-0000-0000-0001-000000000001";
  const t1Stop2Id = "s0000000-0000-0000-0001-000000000002";

  const trip2Id = "t0000000-0000-0000-0000-000000000002";
  const t2Stop1Id = "s0000000-0000-0000-0002-000000000001";

  const trip3Id = "t0000000-0000-0000-0000-000000000003";
  const t3Stop1Id = "s0000000-0000-0000-0003-000000000001";
  const t3Stop2Id = "s0000000-0000-0000-0003-000000000002";

  return [
    // Trip 1: UPCOMING & PUBLIC (Delhi -> Jaipur)
    {
      id: trip1Id,
      user_id: "u0000000-0000-0000-0000-000000000001",
      title: "Rajasthan Royal Heritage & Desert Forts",
      description:
        "A royal journey through the majestic palaces of Jaipur and the historic monuments of Delhi with authentic Rajasthani dining and cultural walks.",
      start_date: formatOffsetDate(14),
      end_date: formatOffsetDate(21),
      target_budget: 2400,
      cover_image_url:
        "https://unsplash.com/photos/uADXI1v10us/download?w=800",
      is_public: true,
      share_slug: "rajasthan-royal-heritage",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      stops: [
        {
          id: t1Stop1Id,
          trip_id: trip1Id,
          city_id: delhi.id,
          stop_order: 0,
          arrival_date: formatOffsetDate(14),
          departure_date: formatOffsetDate(17),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          city: delhi,
          stop_activities: [
            {
              id: "sa-1-1",
              stop_id: t1Stop1Id,
              activity_id: actDelhi[0]?.id || null,
              day_number: 1,
              scheduled_time: "09:30",
              cost: actDelhi[0]?.estimated_cost ?? 14,
              notes: "Meet rickshaw driver at Chandni Chowk metro gate 3.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actDelhi[0] || null,
            },
            {
              id: "sa-1-2",
              stop_id: t1Stop1Id,
              activity_id: actDelhi[1]?.id || null,
              day_number: 2,
              scheduled_time: "14:00",
              cost: actDelhi[1]?.estimated_cost ?? 8,
              notes: "Pre-book online tickets to skip queue.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actDelhi[1] || null,
            },
            {
              id: "sa-1-3",
              stop_id: t1Stop1Id,
              activity_id: actDelhi[4]?.id || null,
              day_number: 2,
              scheduled_time: "18:30",
              cost: actDelhi[4]?.estimated_cost ?? 22,
              notes: "Rooftop table reserved overlooking Hauz Khas reservoir.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actDelhi[4] || null,
            },
          ],
        },
        {
          id: t1Stop2Id,
          trip_id: trip1Id,
          city_id: jaipur.id,
          stop_order: 1,
          arrival_date: formatOffsetDate(17),
          departure_date: formatOffsetDate(21),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          city: jaipur,
          stop_activities: [
            {
              id: "sa-1-4",
              stop_id: t1Stop2Id,
              activity_id: actJaipur[0]?.id || null,
              day_number: 4,
              scheduled_time: "10:00",
              cost: actJaipur[0]?.estimated_cost ?? 10,
              notes: "Guided expedition inside Sheesh Mahal.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actJaipur[0] || null,
            },
            {
              id: "sa-1-5",
              stop_id: t1Stop2Id,
              activity_id: actJaipur[1]?.id || null,
              day_number: 5,
              scheduled_time: "09:00",
              cost: actJaipur[1]?.estimated_cost ?? 12,
              notes: "Best early morning golden light for photography.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actJaipur[1] || null,
            },
            {
              id: "sa-1-6",
              stop_id: t1Stop2Id,
              activity_id: actJaipur[3]?.id || null,
              day_number: 5,
              scheduled_time: "19:30",
              cost: actJaipur[3]?.estimated_cost ?? 20,
              notes: "Authentic Rajasthani village fair and dal baati feast.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actJaipur[3] || null,
            },
          ],
        },
      ],
      expenses: [
        {
          id: "exp-1-1",
          trip_id: trip1Id,
          stop_id: t1Stop1Id,
          activity_id: null,
          category: "Transport",
          amount: 85,
          currency: "USD",
          description: "Delhi to Jaipur AC Superfast Train Tickets",
          date: formatOffsetDate(17),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
        {
          id: "exp-1-2",
          trip_id: trip1Id,
          stop_id: t1Stop2Id,
          activity_id: null,
          category: "Accommodation",
          amount: 450,
          currency: "USD",
          description: "Jaipur Heritage Haveli (4 nights)",
          date: formatOffsetDate(17),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
        {
          id: "exp-1-3",
          trip_id: trip1Id,
          stop_id: t1Stop1Id,
          activity_id: null,
          category: "Food",
          amount: 40,
          currency: "USD",
          description: "Welcome Dinner in Connaught Place",
          date: formatOffsetDate(14),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
      ],
    },

    // Trip 2: ONGOING (Goa Beachside)
    {
      id: trip2Id,
      user_id: "u0000000-0000-0000-0000-000000000001",
      title: "Golden Sands & Spice Coast: Goa Beachside",
      description:
        "Tropical relaxation along the Arabian sea featuring heritage Portuguese villas, waterfall safaris, and coastal seafood.",
      start_date: formatOffsetDate(-2),
      end_date: formatOffsetDate(4),
      target_budget: 1800,
      cover_image_url:
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80",
      is_public: false,
      share_slug: "goa-beachside-getaway",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      stops: [
        {
          id: t2Stop1Id,
          trip_id: trip2Id,
          city_id: goa.id,
          stop_order: 0,
          arrival_date: formatOffsetDate(-2),
          departure_date: formatOffsetDate(4),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          city: goa,
          stop_activities: [
            {
              id: "sa-2-1",
              stop_id: t2Stop1Id,
              activity_id: actGoa[0]?.id || null,
              day_number: 1,
              scheduled_time: "10:00",
              cost: actGoa[0]?.estimated_cost ?? 2,
              notes: "Visit Basilica of Bom Jesus relics.",
              is_completed: true,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actGoa[0] || null,
            },
            {
              id: "sa-2-2",
              stop_id: t2Stop1Id,
              activity_id: actGoa[2]?.id || null,
              day_number: 2,
              scheduled_time: "16:30",
              cost: actGoa[2]?.estimated_cost ?? 8,
              notes: "Explore pastel Portuguese architecture in Fontainhas.",
              is_completed: true,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actGoa[2] || null,
            },
            {
              id: "sa-2-3",
              stop_id: t2Stop1Id,
              activity_id: actGoa[1]?.id || null,
              day_number: 3,
              scheduled_time: "08:30",
              cost: actGoa[1]?.estimated_cost ?? 35,
              notes: "4x4 jungle jeep safari through wildlife sanctuary.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actGoa[1] || null,
            },
          ],
        },
      ],
      expenses: [
        {
          id: "exp-2-1",
          trip_id: trip2Id,
          stop_id: t2Stop1Id,
          activity_id: null,
          category: "Accommodation",
          amount: 380,
          currency: "USD",
          description: "Boutique Beach Resort Booking",
          date: formatOffsetDate(-2),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
        {
          id: "exp-2-2",
          trip_id: trip2Id,
          stop_id: t2Stop1Id,
          activity_id: null,
          category: "Transport",
          amount: 30,
          currency: "USD",
          description: "Scooty Rental & Fuel",
          date: formatOffsetDate(-1),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
      ],
    },

    // Trip 3: COMPLETED (Ahmedabad -> Mumbai)
    {
      id: trip3Id,
      user_id: "u0000000-0000-0000-0000-000000000001",
      title: "Mumbai & Ahmedabad Cultural Explorer",
      description:
        "An immersive cultural tour exploring UNESCO heritage architecture in Ahmedabad and the colonial art deco boulevards of Mumbai.",
      start_date: formatOffsetDate(-30),
      end_date: formatOffsetDate(-22),
      target_budget: 1500,
      cover_image_url:
        "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80",
      is_public: false,
      share_slug: "mumbai-ahmedabad-cultural-tour",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      stops: [
        {
          id: t3Stop1Id,
          trip_id: trip3Id,
          city_id: ahmedabad.id,
          stop_order: 0,
          arrival_date: formatOffsetDate(-30),
          departure_date: formatOffsetDate(-26),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          city: ahmedabad,
          stop_activities: [
            {
              id: "sa-3-1",
              stop_id: t3Stop1Id,
              activity_id: actAhm[0]?.id || null,
              day_number: 1,
              scheduled_time: "09:30",
              cost: actAhm[0]?.estimated_cost ?? 0,
              notes: "Peaceful morning walk at Gandhi Ashram on Sabarmati.",
              is_completed: true,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actAhm[0] || null,
            },
            {
              id: "sa-3-2",
              stop_id: t3Stop1Id,
              activity_id: actAhm[1]?.id || null,
              day_number: 2,
              scheduled_time: "10:00",
              cost: actAhm[1]?.estimated_cost ?? 1,
              notes: "Subterranean 5-story Solanki architecture.",
              is_completed: true,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actAhm[1] || null,
            },
          ],
        },
        {
          id: t3Stop2Id,
          trip_id: trip3Id,
          city_id: mumbai.id,
          stop_order: 1,
          arrival_date: formatOffsetDate(-26),
          departure_date: formatOffsetDate(-22),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          city: mumbai,
          stop_activities: [
            {
              id: "sa-3-3",
              stop_id: t3Stop2Id,
              activity_id: actMum[0]?.id || null,
              day_number: 5,
              scheduled_time: "09:00",
              cost: actMum[0]?.estimated_cost ?? 15,
              notes: "Ferry ride to Elephanta caves.",
              is_completed: true,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actMum[0] || null,
            },
            {
              id: "sa-3-4",
              stop_id: t3Stop2Id,
              activity_id: actMum[1]?.id || null,
              day_number: 5,
              scheduled_time: "17:30",
              cost: actMum[1]?.estimated_cost ?? 0,
              notes: "Sunset stroll along Queen's Necklace.",
              is_completed: true,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actMum[1] || null,
            },
          ],
        },
      ],
      expenses: [
        {
          id: "exp-3-1",
          trip_id: trip3Id,
          stop_id: t3Stop1Id,
          activity_id: null,
          category: "Transport",
          amount: 45,
          currency: "USD",
          description: "Vande Bharat Express (Ahmedabad to Mumbai)",
          date: formatOffsetDate(-26),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
        {
          id: "exp-3-2",
          trip_id: trip3Id,
          stop_id: t3Stop2Id,
          activity_id: null,
          category: "Accommodation",
          amount: 320,
          currency: "USD",
          description: "South Mumbai Art Deco Hotel",
          date: formatOffsetDate(-26),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
      ],
    },
  ];
}

/**
 * Load all stored trips from localStorage or defaults.
 */
export function getStoredTrips(): TripWithDetails[] {
  if (typeof window === "undefined") return createInitialTrips();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialTrips();
      saveAllStoredTrips(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initial = createInitialTrips();
    saveAllStoredTrips(initial);
    return initial;
  } catch (err) {
    console.warn("Failed to load stored trips, using initial:", err);
    return createInitialTrips();
  }
}

/**
 * Save full list of trips to localStorage.
 */
export function saveAllStoredTrips(trips: TripWithDetails[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch (err) {
    console.warn("Failed to save trips to localStorage:", err);
  }
}

const LEGACY_ID_MAP: Record<string, string> = {
  "trip-1": "t0000000-0000-0000-0000-000000000001",
  "trip-2": "t0000000-0000-0000-0000-000000000002",
  "trip-3": "t0000000-0000-0000-0000-000000000003",
  "trip-4": "t0000000-0000-0000-0000-000000000002",
  "trip-5": "t0000000-0000-0000-0000-000000000001",
};

/**
 * Retrieve a specific trip by ID or share slug.
 */
export function getStoredTrip(idOrSlug: string): TripWithDetails | null {
  const resolvedId = LEGACY_ID_MAP[idOrSlug] || idOrSlug;
  const trips = getStoredTrips();
  return (
    trips.find(
      (t) =>
        t.id === resolvedId ||
        t.id === idOrSlug ||
        t.share_slug === idOrSlug ||
        t.share_slug === resolvedId
    ) || null
  );
}

/**
 * Add or update a trip.
 */
export function saveStoredTrip(tripInsert: TripInsert): TripWithDetails {
  const trips = getStoredTrips();
  const tripId = tripInsert.id || generateUUID();
  const existingIdx = trips.findIndex((t) => t.id === tripId);

  const newTrip: TripWithDetails = {
    id: tripId,
    user_id: tripInsert.user_id,
    title: tripInsert.title,
    description: tripInsert.description || null,
    start_date: tripInsert.start_date,
    end_date: tripInsert.end_date,
    target_budget: Number(tripInsert.target_budget || 0),
    cover_image_url: tripInsert.cover_image_url || null,
    is_public: !!tripInsert.is_public,
    share_slug: tripInsert.share_slug || `trip-${tripId.substring(0, 8)}`,
    created_at: existingIdx >= 0 ? trips[existingIdx].created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stops: existingIdx >= 0 ? trips[existingIdx].stops : [],
    expenses: existingIdx >= 0 ? trips[existingIdx].expenses : [],
  };

  if (existingIdx >= 0) {
    trips[existingIdx] = { ...trips[existingIdx], ...newTrip };
  } else {
    trips.unshift(newTrip);
  }

  saveAllStoredTrips(trips);
  return newTrip;
}

/**
 * Delete a trip.
 */
export function deleteStoredTrip(tripId: string): void {
  const trips = getStoredTrips().filter((t) => t.id !== tripId);
  saveAllStoredTrips(trips);
}

/**
 * Add a stop to a stored trip.
 */
export function addStoredStop(stopData: StopInsert, city?: City): StopWithDetails {
  const trips = getStoredTrips();
  const trip = trips.find((t) => t.id === stopData.trip_id);
  if (!trip) {
    throw new Error(`Trip ${stopData.trip_id} not found in store`);
  }

  const resolvedCity =
    city ||
    FALLBACK_CITIES.find((c) => c.id === stopData.city_id) ||
    FALLBACK_CITIES[0];

  const stopId = stopData.id || generateUUID();
  const stopOrder =
    stopData.stop_order !== undefined ? stopData.stop_order : trip.stops.length;

  const newStop: StopWithDetails = {
    id: stopId,
    trip_id: stopData.trip_id,
    city_id: stopData.city_id,
    stop_order: stopOrder,
    arrival_date: stopData.arrival_date || null,
    departure_date: stopData.departure_date || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    city: resolvedCity,
    stop_activities: [],
  };

  trip.stops.push(newStop);
  trip.stops.sort((a, b) => a.stop_order - b.stop_order);
  trip.updated_at = new Date().toISOString();

  saveAllStoredTrips(trips);
  return newStop;
}

/**
 * Update dates / order of a stored stop.
 */
export function updateStoredStop(stopId: string, updates: StopUpdate): StopWithDetails | null {
  const trips = getStoredTrips();
  for (const trip of trips) {
    const stop = trip.stops.find((s) => s.id === stopId);
    if (stop) {
      if (updates.arrival_date !== undefined) stop.arrival_date = updates.arrival_date;
      if (updates.departure_date !== undefined) stop.departure_date = updates.departure_date;
      if (updates.stop_order !== undefined) stop.stop_order = updates.stop_order;
      stop.updated_at = new Date().toISOString();
      trip.updated_at = new Date().toISOString();
      saveAllStoredTrips(trips);
      return stop;
    }
  }
  return null;
}

/**
 * Delete a stop.
 */
export function deleteStoredStop(stopId: string): void {
  const trips = getStoredTrips();
  for (const trip of trips) {
    const idx = trip.stops.findIndex((s) => s.id === stopId);
    if (idx >= 0) {
      trip.stops.splice(idx, 1);
      trip.stops.forEach((s, orderIdx) => {
        s.stop_order = orderIdx;
      });
      trip.updated_at = new Date().toISOString();
      saveAllStoredTrips(trips);
      return;
    }
  }
}

/**
 * Reorder stops.
 */
export function reorderStoredStops(
  tripId: string,
  orderedStops: { id: string; stop_order: number }[]
): void {
  const trips = getStoredTrips();
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) return;

  const map = new Map(orderedStops.map((o) => [o.id, o.stop_order]));
  trip.stops.forEach((s) => {
    if (map.has(s.id)) {
      s.stop_order = map.get(s.id)!;
    }
  });
  trip.stops.sort((a, b) => a.stop_order - b.stop_order);
  trip.updated_at = new Date().toISOString();
  saveAllStoredTrips(trips);
}

/**
 * Add an activity to a stored stop.
 */
export function addStoredStopActivity(activityData: StopActivityInsert): StopActivityWithDetails {
  const trips = getStoredTrips();
  for (const trip of trips) {
    const stop = trip.stops.find((s) => s.id === activityData.stop_id);
    if (stop) {
      const actId = activityData.id || generateUUID();
      const catalogActivity = FALLBACK_ACTIVITIES.find(
        (a) => a.id === activityData.activity_id
      );

      const newAct: StopActivityWithDetails = {
        id: actId,
        stop_id: activityData.stop_id,
        activity_id: activityData.activity_id || null,
        day_number: activityData.day_number || 1,
        scheduled_time: activityData.scheduled_time || null,
        cost: Number(activityData.cost ?? catalogActivity?.estimated_cost ?? 0),
        notes: activityData.notes || null,
        is_completed: !!activityData.is_completed,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        activity: catalogActivity || null,
      };

      if (!stop.stop_activities) stop.stop_activities = [];
      stop.stop_activities.push(newAct);
      stop.stop_activities.sort((a, b) => a.day_number - b.day_number);
      trip.updated_at = new Date().toISOString();
      saveAllStoredTrips(trips);
      return newAct;
    }
  }
  throw new Error(`Stop ${activityData.stop_id} not found in store`);
}

/**
 * Update a scheduled activity.
 */
export function updateStoredStopActivity(
  actId: string,
  updates: StopActivityUpdate
): StopActivityWithDetails | null {
  const trips = getStoredTrips();
  for (const trip of trips) {
    for (const stop of trip.stops) {
      const act = (stop.stop_activities || []).find((a) => a.id === actId);
      if (act) {
        if (updates.scheduled_time !== undefined) act.scheduled_time = updates.scheduled_time;
        if (updates.day_number !== undefined) act.day_number = updates.day_number;
        if (updates.cost !== undefined) act.cost = Number(updates.cost);
        if (updates.notes !== undefined) act.notes = updates.notes;
        if (updates.is_completed !== undefined) act.is_completed = updates.is_completed;
        act.updated_at = new Date().toISOString();
        trip.updated_at = new Date().toISOString();
        saveAllStoredTrips(trips);
        return act;
      }
    }
  }
  return null;
}

/**
 * Delete a scheduled activity.
 */
export function deleteStoredStopActivity(actId: string): void {
  const trips = getStoredTrips();
  for (const trip of trips) {
    for (const stop of trip.stops) {
      const idx = (stop.stop_activities || []).findIndex((a) => a.id === actId);
      if (idx >= 0) {
        stop.stop_activities!.splice(idx, 1);
        trip.updated_at = new Date().toISOString();
        saveAllStoredTrips(trips);
        return;
      }
    }
  }
}

/**
 * Add an expense.
 */
export function addStoredExpense(expData: ExpenseInsert): Expense {
  const trips = getStoredTrips();
  const trip = trips.find((t) => t.id === expData.trip_id);
  if (!trip) throw new Error(`Trip ${expData.trip_id} not found in store`);

  const exp: Expense = {
    id: expData.id || generateUUID(),
    trip_id: expData.trip_id,
    stop_id: expData.stop_id || null,
    activity_id: expData.activity_id || null,
    category: expData.category,
    amount: Number(expData.amount || 0),
    currency: expData.currency || "USD",
    description: expData.description || null,
    date: expData.date || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!trip.expenses) trip.expenses = [];
  trip.expenses.push(exp);
  trip.updated_at = new Date().toISOString();
  saveAllStoredTrips(trips);
  return exp;
}

/**
 * Delete an expense.
 */
export function deleteStoredExpense(expId: string): void {
  const trips = getStoredTrips();
  for (const trip of trips) {
    const idx = (trip.expenses || []).findIndex((e) => e.id === expId);
    if (idx >= 0) {
      trip.expenses!.splice(idx, 1);
      trip.updated_at = new Date().toISOString();
      saveAllStoredTrips(trips);
      return;
    }
  }
}
