import type {
  TripWithDetails,
  StopWithDetails,
  StopActivityWithDetails,
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

const STORAGE_KEY = "globetrotter_trips_store_v2";

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
  const manali = FALLBACK_CITIES.find((c) => c.name === "Manali") || FALLBACK_CITIES[6];
  const bangalore = FALLBACK_CITIES.find((c) => c.name === "Bangalore") || FALLBACK_CITIES[3];

  const actDelhi = FALLBACK_ACTIVITIES.filter((a) => a.city_id === delhi.id);
  const actJaipur = FALLBACK_ACTIVITIES.filter((a) => a.city_id === jaipur.id);
  const actGoa = FALLBACK_ACTIVITIES.filter((a) => a.city_id === goa.id);
  const actAhm = FALLBACK_ACTIVITIES.filter((a) => a.city_id === ahmedabad.id);
  const actMum = FALLBACK_ACTIVITIES.filter((a) => a.city_id === mumbai.id);
  const actManali = FALLBACK_ACTIVITIES.filter((a) => a.city_id === manali.id);
  const actBlr = FALLBACK_ACTIVITIES.filter((a) => a.city_id === bangalore.id);

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

  const trip4Id = "t0000000-0000-0000-0000-000000000004";
  const t4Stop1Id = "s0000000-0000-0000-0004-000000000001";

  const trip5Id = "t0000000-0000-0000-0000-000000000005";
  const t5Stop1Id = "s0000000-0000-0000-0005-000000000001";

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
              activity_id: actDelhi[2]?.id || null,
              day_number: 3,
              scheduled_time: "17:30",
              cost: actDelhi[2]?.estimated_cost ?? 0,
              notes: "Sunset picnic overlooking the lawns.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actDelhi[2] || null,
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
              scheduled_time: "08:30",
              cost: actJaipur[0]?.estimated_cost ?? 7,
              notes: "Early morning jeep to avoid elephant rush.",
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
              scheduled_time: "10:00",
              cost: actJaipur[1]?.estimated_cost ?? 4,
              notes: "Rooftop photography from Wind View Cafe.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actJaipur[1] || null,
            },
            {
              id: "sa-1-6",
              stop_id: t1Stop2Id,
              activity_id: actJaipur[2]?.id || null,
              day_number: 5,
              scheduled_time: "19:30",
              cost: actJaipur[2]?.estimated_cost ?? 18,
              notes: "Traditional Gatte ki Sabzi and Dal Baati Churma.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actJaipur[2] || null,
            },
            {
              id: "sa-1-7",
              stop_id: t1Stop2Id,
              activity_id: actJaipur[3]?.id || null,
              day_number: 6,
              scheduled_time: "15:00",
              cost: actJaipur[3]?.estimated_cost ?? 0,
              notes: "Shop for blue pottery, block print textiles, and mojris.",
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
          description: "Private AC Cab (Delhi to Jaipur Express Highway)",
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
          amount: 525,
          currency: "USD",
          description: "Heritage Haveli Stay in Old Jaipur",
          date: formatOffsetDate(17),
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
              notes: "Dress respectfully with covered shoulders.",
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
              notes: "Explore colorful Portuguese alleys and art cafes.",
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
              scheduled_time: "07:00",
              cost: actGoa[1]?.estimated_cost ?? 35,
              notes: "Full day 4x4 jungle jeep safari.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actGoa[1] || null,
            },
            {
              id: "sa-2-4",
              stop_id: t2Stop1Id,
              activity_id: actGoa[4]?.id || null,
              day_number: 4,
              scheduled_time: "12:00",
              cost: actGoa[4]?.estimated_cost ?? 15,
              notes: "Authentic Goan buffet on banana leaves.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actGoa[4] || null,
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
          category: "Transport",
          amount: 45,
          currency: "USD",
          description: "Scooter Rental (5 Days)",
          date: formatOffsetDate(-2),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
        {
          id: "exp-2-2",
          trip_id: trip2Id,
          stop_id: t2Stop1Id,
          activity_id: null,
          category: "Accommodation",
          amount: 350,
          currency: "USD",
          description: "Beachfront Villa at Candolim",
          date: formatOffsetDate(-2),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
      ],
    },

    // Trip 3: COMPLETED / PAST (Ahmedabad -> Mumbai)
    {
      id: trip3Id,
      user_id: "u0000000-0000-0000-0000-000000000001",
      title: "Cultural Crossroads: Mumbai & Ahmedabad Explorer",
      description:
        "Retrace western India's architectural heritage from stepwells to Art Deco promenades.",
      start_date: formatOffsetDate(-30),
      end_date: formatOffsetDate(-22),
      target_budget: 2100,
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
            {
              id: "sa-3-3",
              stop_id: t3Stop1Id,
              activity_id: actAhm[2]?.id || null,
              day_number: 3,
              scheduled_time: "21:00",
              cost: actAhm[2]?.estimated_cost ?? 5,
              notes: "Night market street food tour.",
              is_completed: true,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actAhm[2] || null,
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
              id: "sa-3-4",
              stop_id: t3Stop2Id,
              activity_id: actMum[0]?.id || null,
              day_number: 5,
              scheduled_time: "09:00",
              cost: actMum[0]?.estimated_cost ?? 0,
              notes: "Gateway of India & Taj Mahal Palace exterior walk.",
              is_completed: true,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actMum[0] || null,
            },
            {
              id: "sa-3-5",
              stop_id: t3Stop2Id,
              activity_id: actMum[2]?.id || null,
              day_number: 6,
              scheduled_time: "08:30",
              cost: actMum[2]?.estimated_cost ?? 4,
              notes: "Brun Maska, Bun Maska Chai at Kyani & Co.",
              is_completed: true,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actMum[2] || null,
            },
            {
              id: "sa-3-6",
              stop_id: t3Stop2Id,
              activity_id: actMum[1]?.id || null,
              day_number: 7,
              scheduled_time: "17:30",
              cost: actMum[1]?.estimated_cost ?? 0,
              notes: "Sunset promenade walk along Queen's Necklace.",
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

    // Trip 4: UPCOMING & PUBLIC (Manali & Solang Valley)
    {
      id: trip4Id,
      user_id: "u0000000-0000-0000-0000-000000000001",
      title: "Himalayan Alpine Wonderland: Manali & Solang Valley",
      description:
        "High-altitude adventure through snowy mountain passes, apple orchards, Solang Valley paragliding, and historic wooden temples.",
      start_date: formatOffsetDate(28),
      end_date: formatOffsetDate(34),
      target_budget: 1400,
      cover_image_url:
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80",
      is_public: true,
      share_slug: "himalayan-alpine-manali",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      stops: [
        {
          id: t4Stop1Id,
          trip_id: trip4Id,
          city_id: manali.id,
          stop_order: 0,
          arrival_date: formatOffsetDate(28),
          departure_date: formatOffsetDate(34),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          city: manali,
          stop_activities: [
            {
              id: "sa-4-1",
              stop_id: t4Stop1Id,
              activity_id: actManali[0]?.id || null,
              day_number: 1,
              scheduled_time: "10:00",
              cost: actManali[0]?.estimated_cost ?? 40,
              notes: "Tandem paragliding flight over Solang Valley with GoPro footage.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actManali[0] || null,
            },
            {
              id: "sa-4-2",
              stop_id: t4Stop1Id,
              activity_id: actManali[1]?.id || null,
              day_number: 2,
              scheduled_time: "07:30",
              cost: actManali[1]?.estimated_cost ?? 30,
              notes: "Drive through Atal Tunnel to high altitude glaciers at Rohtang Pass.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actManali[1] || null,
            },
            {
              id: "sa-4-3",
              stop_id: t4Stop1Id,
              activity_id: actManali[2]?.id || null,
              day_number: 3,
              scheduled_time: "18:00",
              cost: actManali[2]?.estimated_cost ?? 15,
              notes: "Wood-fired trout dinner with acoustic mountain music in Old Manali.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actManali[2] || null,
            },
            {
              id: "sa-4-4",
              stop_id: t4Stop1Id,
              activity_id: actManali[3]?.id || null,
              day_number: 4,
              scheduled_time: "11:00",
              cost: actManali[3]?.estimated_cost ?? 1,
              notes: "Historic 1553 pagoda wood temple in deodar cedar forest.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actManali[3] || null,
            },
          ],
        },
      ],
      expenses: [
        {
          id: "exp-4-1",
          trip_id: trip4Id,
          stop_id: t4Stop1Id,
          activity_id: null,
          category: "Accommodation",
          amount: 380,
          currency: "USD",
          description: "Riverside Apple Orchard Pine Cottage",
          date: formatOffsetDate(28),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
        {
          id: "exp-4-2",
          trip_id: trip4Id,
          stop_id: t4Stop1Id,
          activity_id: null,
          category: "Transport",
          amount: 60,
          currency: "USD",
          description: "Private SUV Airport Transfer (Bhuntar to Manali)",
          date: formatOffsetDate(28),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
      ],
    },

    // Trip 5: UPCOMING & PUBLIC (Bangalore Explorer)
    {
      id: trip5Id,
      user_id: "u0000000-0000-0000-0000-000000000001",
      title: "Silicon Garden & Heritage Trails: Bangalore Explorer",
      description:
        "Experience Bangalore's legendary lush botanical gardens, vintage breakfast tiffin rooms in Malleshwaram, and vibrant microbrewery hubs.",
      start_date: formatOffsetDate(42),
      end_date: formatOffsetDate(47),
      target_budget: 1100,
      cover_image_url:
        "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=80",
      is_public: true,
      share_slug: "bangalore-heritage-garden-trails",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      stops: [
        {
          id: t5Stop1Id,
          trip_id: trip5Id,
          city_id: bangalore.id,
          stop_order: 0,
          arrival_date: formatOffsetDate(42),
          departure_date: formatOffsetDate(47),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          city: bangalore,
          stop_activities: [
            {
              id: "sa-5-1",
              stop_id: t5Stop1Id,
              activity_id: actBlr[0]?.id || null,
              day_number: 1,
              scheduled_time: "07:30",
              cost: actBlr[0]?.estimated_cost ?? 2,
              notes: "Morning walking tour of the 240-acre garden and Glass House.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actBlr[0] || null,
            },
            {
              id: "sa-5-2",
              stop_id: t5Stop1Id,
              activity_id: actBlr[4]?.id || null,
              day_number: 2,
              scheduled_time: "08:30",
              cost: actBlr[4]?.estimated_cost ?? 6,
              notes: "Crispy butter dosas & filter coffee at legendary Malleshwaram eateries.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actBlr[4] || null,
            },
            {
              id: "sa-5-3",
              stop_id: t5Stop1Id,
              activity_id: actBlr[2]?.id || null,
              day_number: 3,
              scheduled_time: "11:00",
              cost: actBlr[2]?.estimated_cost ?? 6,
              notes: "Tudor-style wooden carvings & royal vintage carriages.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actBlr[2] || null,
            },
            {
              id: "sa-5-4",
              stop_id: t5Stop1Id,
              activity_id: actBlr[1]?.id || null,
              day_number: 4,
              scheduled_time: "19:00",
              cost: actBlr[1]?.estimated_cost ?? 25,
              notes: "Craft beer tasting & wood-fired pizza trail in Indiranagar.",
              is_completed: false,
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
              activity: actBlr[1] || null,
            },
          ],
        },
      ],
      expenses: [
        {
          id: "exp-5-1",
          trip_id: trip5Id,
          stop_id: t5Stop1Id,
          activity_id: null,
          category: "Accommodation",
          amount: 290,
          currency: "USD",
          description: "Indiranagar Boutique Heritage Hotel",
          date: formatOffsetDate(42),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
        {
          id: "exp-5-2",
          trip_id: trip5Id,
          stop_id: t5Stop1Id,
          activity_id: null,
          category: "Food & Dining",
          amount: 50,
          currency: "USD",
          description: "Chef's Tasting Dinner at Indiranagar",
          date: formatOffsetDate(43),
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
  "trip-4": "t0000000-0000-0000-0000-000000000004",
  "trip-5": "t0000000-0000-0000-0000-000000000005",
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
    share_slug: tripInsert.share_slug || tripInsert.title.toLowerCase().replace(/\s+/g, "-"),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stops: [],
    expenses: [],
  };

  if (existingIdx >= 0) {
    trips[existingIdx] = {
      ...trips[existingIdx],
      ...newTrip,
      stops: trips[existingIdx].stops,
      expenses: trips[existingIdx].expenses,
    };
  } else {
    trips.unshift(newTrip);
  }

  saveAllStoredTrips(trips);
  return existingIdx >= 0 ? trips[existingIdx] : newTrip;
}

/**
 * Delete a trip by ID.
 */
export function deleteStoredTrip(tripId: string): void {
  const trips = getStoredTrips().filter((t) => t.id !== tripId);
  saveAllStoredTrips(trips);
}

/**
 * Add a stop to a trip.
 */
export function addStoredStop(stopInsert: StopInsert): StopWithDetails {
  const trips = getStoredTrips();
  const trip = trips.find((t) => t.id === stopInsert.trip_id);
  if (!trip) throw new Error("Trip not found");

  const city = FALLBACK_CITIES.find((c) => c.id === stopInsert.city_id) || {
    id: stopInsert.city_id,
    name: "Unknown City",
    country: "India",
    region: null,
    cost_index: 3,
    popularity_score: 80,
    latitude: 0,
    longitude: 0,
    image_url: null,
    description: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const newStop: StopWithDetails = {
    id: stopInsert.id || generateUUID(),
    trip_id: stopInsert.trip_id,
    city_id: stopInsert.city_id,
    stop_order: stopInsert.stop_order ?? (trip.stops ? trip.stops.length : 0),
    arrival_date: stopInsert.arrival_date || null,
    departure_date: stopInsert.departure_date || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    city,
    stop_activities: [],
  };

  if (!trip.stops) trip.stops = [];
  trip.stops.push(newStop);
  trip.stops.sort((a, b) => a.stop_order - b.stop_order);

  saveAllStoredTrips(trips);
  return newStop;
}

/**
 * Update a stop.
 */
export function updateStoredStop(stopId: string, updates: StopUpdate): StopWithDetails {
  const trips = getStoredTrips();
  for (const trip of trips) {
    const stop = (trip.stops || []).find((s) => s.id === stopId);
    if (stop) {
      if (updates.arrival_date !== undefined) stop.arrival_date = updates.arrival_date;
      if (updates.departure_date !== undefined) stop.departure_date = updates.departure_date;
      if (updates.stop_order !== undefined) stop.stop_order = updates.stop_order;
      stop.updated_at = new Date().toISOString();
      trip.stops?.sort((a, b) => a.stop_order - b.stop_order);
      saveAllStoredTrips(trips);
      return stop;
    }
  }
  throw new Error("Stop not found");
}

/**
 * Delete a stop from a trip.
 */
export function deleteStoredStop(stopId: string): void {
  const trips = getStoredTrips();
  for (const trip of trips) {
    if (trip.stops) {
      const idx = trip.stops.findIndex((s) => s.id === stopId);
      if (idx >= 0) {
        trip.stops.splice(idx, 1);
        trip.stops.forEach((s, i) => {
          s.stop_order = i;
        });
        saveAllStoredTrips(trips);
        return;
      }
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
  if (!trip || !trip.stops) return;

  const orderMap = new Map(orderedStops.map((item) => [item.id, item.stop_order]));
  trip.stops.forEach((stop) => {
    if (orderMap.has(stop.id)) {
      stop.stop_order = orderMap.get(stop.id)!;
    }
  });

  trip.stops.sort((a, b) => a.stop_order - b.stop_order);
  saveAllStoredTrips(trips);
}

/**
 * Add an activity to a stop.
 */
export function addStoredStopActivity(activityInsert: StopActivityInsert): StopActivityWithDetails {
  const trips = getStoredTrips();
  for (const trip of trips) {
    const stop = (trip.stops || []).find((s) => s.id === activityInsert.stop_id);
    if (stop) {
      let catalogActivity = null;
      if (activityInsert.activity_id) {
        catalogActivity =
          FALLBACK_ACTIVITIES.find((a) => a.id === activityInsert.activity_id) || null;
      }

      const newActivity: StopActivityWithDetails = {
        id: activityInsert.id || generateUUID(),
        stop_id: activityInsert.stop_id,
        activity_id: activityInsert.activity_id || null,
        day_number: activityInsert.day_number || 1,
        scheduled_time: activityInsert.scheduled_time || null,
        cost: Number(activityInsert.cost || 0),
        notes: activityInsert.notes || null,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        activity: catalogActivity,
      };

      if (!stop.stop_activities) stop.stop_activities = [];
      stop.stop_activities.push(newActivity);
      stop.stop_activities.sort((a, b) => a.day_number - b.day_number);

      saveAllStoredTrips(trips);
      return newActivity;
    }
  }
  throw new Error("Stop not found");
}

/**
 * Update an activity in a stop.
 */
export function updateStoredStopActivity(
  activityId: string,
  updates: StopActivityUpdate
): StopActivityWithDetails {
  const trips = getStoredTrips();
  for (const trip of trips) {
    for (const stop of trip.stops || []) {
      const act = (stop.stop_activities || []).find((a) => a.id === activityId);
      if (act) {
        if (updates.day_number !== undefined) act.day_number = updates.day_number;
        if (updates.scheduled_time !== undefined) act.scheduled_time = updates.scheduled_time;
        if (updates.cost !== undefined) act.cost = Number(updates.cost);
        if (updates.notes !== undefined) act.notes = updates.notes;
        if (updates.is_completed !== undefined) act.is_completed = updates.is_completed;
        act.updated_at = new Date().toISOString();

        stop.stop_activities?.sort((a, b) => a.day_number - b.day_number);
        saveAllStoredTrips(trips);
        return act;
      }
    }
  }
  throw new Error("Activity not found");
}

/**
 * Delete an activity from a stop.
 */
export function deleteStoredStopActivity(activityId: string): void {
  const trips = getStoredTrips();
  for (const trip of trips) {
    for (const stop of trip.stops || []) {
      if (stop.stop_activities) {
        const idx = stop.stop_activities.findIndex((a) => a.id === activityId);
        if (idx >= 0) {
          stop.stop_activities.splice(idx, 1);
          saveAllStoredTrips(trips);
          return;
        }
      }
    }
  }
}

/**
 * Add an expense to a trip.
 */
export function addStoredExpense(expenseInsert: ExpenseInsert): Expense {
  const trips = getStoredTrips();
  const trip = trips.find((t) => t.id === expenseInsert.trip_id);
  if (!trip) throw new Error("Trip not found");

  const newExpense: Expense = {
    id: expenseInsert.id || generateUUID(),
    trip_id: expenseInsert.trip_id,
    stop_id: expenseInsert.stop_id || null,
    activity_id: expenseInsert.activity_id || null,
    category: expenseInsert.category,
    amount: Number(expenseInsert.amount),
    currency: expenseInsert.currency || "USD",
    description: expenseInsert.description || null,
    date: expenseInsert.date || new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!trip.expenses) trip.expenses = [];
  trip.expenses.push(newExpense);
  saveAllStoredTrips(trips);
  return newExpense;
}
