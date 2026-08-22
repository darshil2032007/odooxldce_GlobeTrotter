import { calculateTripBudget } from "./calculator";
import { generateBudgetSuggestions } from "./assistantEngine";
import { scoreDestination } from "@/features/recommendations/engine/scoringEngine";
import type { TripWithDetails, City, Activity } from "@/types/database";

function createMockTrip(
  targetBudget: number,
  activities: { cost: number; cityId: string; cityName: string; day: number; title: string; category: string }[] = [],
  daysCount: number = 5
): TripWithDetails {
  const startDate = "2026-09-01";
  const endDate = new Date(new Date(startDate).getTime() + (daysCount - 1) * 86400000)
    .toISOString()
    .split("T")[0];

  // Group by city
  const cityStopsMap = new Map<string, typeof activities>();
  activities.forEach((act) => {
    if (!cityStopsMap.has(act.cityId)) {
      cityStopsMap.set(act.cityId, []);
    }
    cityStopsMap.get(act.cityId)!.push(act);
  });

  const stops = Array.from(cityStopsMap.entries()).map(([cityId, acts], idx) => ({
    id: `stop-${cityId}`,
    trip_id: "trip-test-1",
    city_id: cityId,
    stop_order: idx + 1,
    arrival_date: startDate,
    departure_date: endDate,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    city: {
      id: cityId,
      name: acts[0].cityName,
      country: "India",
      region: "West",
      cost_index: 60,
      popularity_score: 85,
      latitude: null,
      longitude: null,
      image_url: null,
      description: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    stop_activities: acts.map((a, aIdx) => ({
      id: `sa-${cityId}-${aIdx}`,
      stop_id: `stop-${cityId}`,
      activity_id: `act-${cityId}-${aIdx}`,
      day_number: a.day,
      scheduled_time: "10:00",
      cost: a.cost,
      notes: null,
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      activity: {
        id: `act-${cityId}-${aIdx}`,
        city_id: cityId,
        title: a.title,
        description: "Test activity",
        category: a.category,
        estimated_cost: a.cost,
        duration_hours: 2,
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    })),
  }));

  return {
    id: "trip-test-1",
    user_id: "user-1",
    title: "Test Expedition",
    description: "Testing deterministic calculation",
    start_date: startDate,
    end_date: endDate,
    target_budget: targetBudget,
    cover_image_url: null,
    is_public: true,
    share_slug: "test-expedition-123",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stops,
    expenses: [],
  };
}

export function runBudgetEngineVerification() {
  const results: { name: string; passed: boolean; details?: string }[] = [];

  // Test 1: Budget under limit
  {
    const trip = createMockTrip(50000, [
      { cost: 15000, cityId: "city-1", cityName: "Mumbai", day: 1, title: "Heritage Walk", category: "Culture" },
      { cost: 20000, cityId: "city-1", cityName: "Mumbai", day: 2, title: "Culinary Tour", category: "Food" },
    ]);
    const b = calculateTripBudget(trip);
    const passed = b.total === 35000 && b.remaining === 15000 && b.isOverBudget === false && b.percentageUsed === 70;
    results.push({ name: "Budget under limit", passed, details: `Total: ${b.total}, Remaining: ${b.remaining}` });
  }

  // Test 2: Budget exactly at limit
  {
    const trip = createMockTrip(30000, [
      { cost: 10000, cityId: "city-1", cityName: "Goa", day: 1, title: "Beach Cruise", category: "Activities" },
      { cost: 20000, cityId: "city-1", cityName: "Goa", day: 2, title: "Resort Stay", category: "Accommodation" },
    ]);
    const b = calculateTripBudget(trip);
    const passed = b.total === 30000 && b.remaining === 0 && b.isOverBudget === false && b.percentageUsed === 100;
    results.push({ name: "Budget exactly at limit", passed, details: `Total: ${b.total}, Remaining: ${b.remaining}` });
  }

  // Test 3: Budget over limit
  {
    const trip = createMockTrip(30000, [
      { cost: 25000, cityId: "city-1", cityName: "Goa", day: 1, title: "Scuba Diving", category: "Adventure" },
      { cost: 10500, cityId: "city-1", cityName: "Goa", day: 2, title: "Private Yacht", category: "Activities" },
    ]);
    const b = calculateTripBudget(trip);
    const passed = b.total === 35500 && b.remaining === -5500 && b.isOverBudget === true && b.overBudgetAmount === 5500 && b.percentageUsed === 118.3;
    results.push({ name: "Budget over limit (example ₹35,500 / ₹30,000 -> 118.3%)", passed, details: `Total: ${b.total}, Over: ${b.overBudgetAmount}` });
  }

  // Test 4: No activities
  {
    const trip = createMockTrip(40000, []);
    const b = calculateTripBudget(trip);
    const passed = b.total === 0 && b.remaining === 40000 && b.isOverBudget === false && b.percentageUsed === 0 && b.mostExpensiveDay === null;
    results.push({ name: "No activities", passed, details: `Total: ${b.total}, Remaining: ${b.remaining}` });
  }

  // Test 5: One activity
  {
    const trip = createMockTrip(10000, [
      { cost: 4500, cityId: "city-1", cityName: "Jaipur", day: 1, title: "Amber Fort Tour", category: "Culture" },
    ]);
    const b = calculateTripBudget(trip);
    const passed = b.total === 4500 && b.remaining === 5500 && b.mostExpensiveCategory?.category === "Culture" && b.mostExpensiveDay?.dayNumber === 1;
    results.push({ name: "One activity", passed, details: `Top Category: ${b.mostExpensiveCategory?.category}` });
  }

  // Test 6: Multiple days and multiple cities
  {
    const trip = createMockTrip(60000, [
      { cost: 12000, cityId: "city-1", cityName: "Delhi", day: 1, title: "Red Fort", category: "Culture" },
      { cost: 18000, cityId: "city-1", cityName: "Delhi", day: 2, title: "Chandni Chowk", category: "Food" },
      { cost: 25000, cityId: "city-2", cityName: "Agra", day: 3, title: "Taj Mahal VIP", category: "Culture" },
      { cost: 5000, cityId: "city-2", cityName: "Agra", day: 4, title: "Mehtab Bagh", category: "Sightseeing" },
    ]);
    const b = calculateTripBudget(trip);
    const passed = b.total === 60000 && b.cityBreakdown.length === 2 && b.mostExpensiveDay?.dayNumber === 3 && b.mostExpensiveDay?.amount === 25000;
    results.push({ name: "Multiple days and multiple cities", passed, details: `City count: ${b.cityBreakdown.length}, Peak day: Day ${b.mostExpensiveDay?.dayNumber}` });
  }

  // Test 7: Smart Budget Assistant with cheaper alternatives
  {
    const trip = createMockTrip(30000, [
      { cost: 2500, cityId: "city-goa", cityName: "Goa", day: 4, title: "Scuba Diving", category: "Adventure" },
      { cost: 33000, cityId: "city-goa", cityName: "Goa", day: 1, title: "Luxury Villa", category: "Accommodation" },
    ]);
    const budget = calculateTripBudget(trip);

    const catalog: Activity[] = [
      {
        id: "act-fort-aguada",
        city_id: "city-goa",
        title: "Fort Aguada",
        description: "Historic 17th-century Portuguese fort and lighthouse.",
        category: "Adventure",
        estimated_cost: 50,
        duration_hours: 2,
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const assistant = generateBudgetSuggestions(trip, budget, catalog);
    const passed =
      assistant.isOverBudget === true &&
      assistant.deficit === 5500 &&
      assistant.suggestions.length > 0 &&
      assistant.suggestions[0].savings === 2450 &&
      assistant.suggestions[0].suggestedCost === 50;

    results.push({
      name: "Smart Budget Assistant (Replace Scuba Diving ₹2,500 with Fort Aguada ₹50 -> Save ₹2,450)",
      passed,
      details: `Suggestions count: ${assistant.suggestions.length}, Top saving: ₹${assistant.suggestions[0]?.savings}`,
    });
  }

  // Test 8: Destination scoring engine
  {
    const city: City = {
      id: "city-jaipur",
      name: "Jaipur",
      country: "India",
      region: "Rajasthan",
      cost_index: 55,
      popularity_score: 90,
      latitude: null,
      longitude: null,
      image_url: null,
      description: "The Pink City of palaces, forts, and vibrant bazaars.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const activities: Activity[] = [
      {
        id: "act-1",
        city_id: "city-jaipur",
        title: "Amber Palace",
        description: "Majestic hilltop fort palace.",
        category: "Culture",
        estimated_cost: 500,
        duration_hours: 3,
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const scored = scoreDestination(city, activities, {
      targetBudget: 40000,
      durationDays: 5,
      interests: ["Culture"],
      travelStyle: "moderate",
    });

    const passed = scored.score > 0 && scored.score <= 100 && scored.breakdown.totalScore === scored.score;
    results.push({ name: "Destination Scoring Engine", passed, details: `Score: ${scored.score}%, Fit: ${scored.fitLabel}` });
  }

  return results;
}
