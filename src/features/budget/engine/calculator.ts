import type { TripWithDetails, Expense } from "@/types/database";
import type {
  TripBudgetCalculation,
  CategoryCostItem,
  DailyCostItem,
  ActivityCostItem,
  CityCostItem,
  BudgetHealthStatus,
} from "../types";

export const CATEGORY_COLORS: Record<string, string> = {
  Activities: "#0ea5e9", // Sky blue
  Sightseeing: "#0ea5e9",
  Adventure: "#f97316", // Orange
  Culture: "#8b5cf6", // Purple
  Transport: "#10b981", // Emerald
  Accommodation: "#6366f1", // Indigo
  Food: "#f59e0b", // Amber
  Dining: "#f59e0b",
  Shopping: "#ec4899", // Pink
  Relaxation: "#14b8a6", // Teal
  Entertainment: "#a855f7", // Violet
  Other: "#64748b", // Slate
};

export function getCategoryColor(category: string): string {
  if (CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category];
  }
  const normalized = category.trim().toLowerCase();
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (key.toLowerCase() === normalized) {
      return color;
    }
  }
  return "#64748b";
}

/**
 * Normalizes an arbitrary activity or expense category into a user-friendly category.
 */
export function normalizeCategory(category?: string | null): string {
  if (!category || !category.trim()) return "Other";
  const cat = category.trim();
  const lower = cat.toLowerCase();

  if (["activity", "activities", "tour", "tours", "sightseeing", "visit", "museum", "attraction", "adventure"].some((k) => lower.includes(k))) {
    return "Activities";
  }
  if (["transport", "flight", "train", "bus", "cab", "taxi", "car", "transit", "ferry"].some((k) => lower.includes(k))) {
    return "Transport";
  }
  if (["hotel", "stay", "accommodation", "hostel", "resort", "airbnb", "lodging"].some((k) => lower.includes(k))) {
    return "Accommodation";
  }
  if (["food", "dining", "meal", "restaurant", "lunch", "dinner", "breakfast", "drinks", "cafe"].some((k) => lower.includes(k))) {
    return "Food";
  }
  return cat;
}

/**
 * Calculates deterministic trip duration in days from ISO dates.
 * Guaranteed minimum of 1 day.
 */
export function calculateDurationInDays(startDateStr: string, endDateStr: string): number {
  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1); // Inclusive duration: e.g. Sep 1 to Sep 3 = 3 days
  } catch {
    return 1;
  }
}

/**
 * Deterministic Trip Budget Calculator.
 *
 * Computes:
 * - Total trip cost
 * - Target budget & remaining amount
 * - Percentage used
 * - Over-budget deficit detection
 * - Daily cost breakdown
 * - Category cost breakdown
 * - Most expensive day & most expensive category
 *
 * @param trip Full trip details with relational stops, activities, and expenses
 * @param customTargetBudget Optional override for target budget
 */
export function calculateTripBudget(
  trip: TripWithDetails,
  customTargetBudget?: number
): TripBudgetCalculation {
  const targetBudget = Number(
    customTargetBudget !== undefined ? customTargetBudget : trip.target_budget || 0
  );
  const durationDays = calculateDurationInDays(trip.start_date, trip.end_date);

  const flatActivities: ActivityCostItem[] = [];
  const categoryTotals = new Map<string, { total: number; count: number }>();
  const cityTotals = new Map<string, { name: string; total: number; count: number }>();
  const dayTotals = new Map<number, { amount: number; count: number; cityName?: string }>();

  // Pre-populate days 1..durationDays
  for (let day = 1; day <= durationDays; day++) {
    dayTotals.set(day, { amount: 0, count: 0 });
  }

  let totalTripCost = 0;

  // 1. Process Stops & Stop Activities
  const stops = trip.stops || [];
  for (const stop of stops) {
    const cityName = stop.city?.name || "Destination";
    const cityId = stop.city_id;

    if (!cityTotals.has(cityId)) {
      cityTotals.set(cityId, { name: cityName, total: 0, count: 0 });
    }
    const cityEntry = cityTotals.get(cityId)!;

    const stopActs = stop.stop_activities || [];
    for (const sa of stopActs) {
      const cost = Number(sa.cost ?? sa.activity?.estimated_cost ?? 0);
      const title = sa.activity?.title || sa.notes || "Activity";
      const rawCategory = sa.activity?.category || "Activities";
      const category = rawCategory.trim() || "Activities";
      const dayNumber = Math.max(1, sa.day_number || 1);

      totalTripCost += cost;

      // Flat activity record
      flatActivities.push({
        id: sa.id,
        stopId: stop.id,
        activityId: sa.activity_id,
        title,
        cost,
        category,
        dayNumber,
        cityName,
        cityId,
        isCompleted: !!sa.is_completed,
        scheduledTime: sa.scheduled_time,
        notes: sa.notes,
      });

      // Update Category breakdown
      if (!categoryTotals.has(category)) {
        categoryTotals.set(category, { total: 0, count: 0 });
      }
      const catEntry = categoryTotals.get(category)!;
      catEntry.total += cost;
      catEntry.count += 1;

      // Update City breakdown
      cityEntry.total += cost;
      cityEntry.count += 1;

      // Update Day breakdown
      if (!dayTotals.has(dayNumber)) {
        dayTotals.set(dayNumber, { amount: 0, count: 0, cityName });
      }
      const dayEntry = dayTotals.get(dayNumber)!;
      dayEntry.amount += cost;
      dayEntry.count += 1;
      if (!dayEntry.cityName) {
        dayEntry.cityName = cityName;
      }
    }
  }

  // 2. Process Manual/Recorded Expenses (if any)
  const expenses: Expense[] = trip.expenses || [];
  for (const exp of expenses) {
    const amount = Number(exp.amount || 0);
    const category = exp.category?.trim() || "Other";
    totalTripCost += amount;

    if (!categoryTotals.has(category)) {
      categoryTotals.set(category, { total: 0, count: 0 });
    }
    const catEntry = categoryTotals.get(category)!;
    catEntry.total += amount;
    catEntry.count += 1;
  }

  // 3. Deterministic Arithmetic Calculations
  const remaining = targetBudget - totalTripCost;
  const isOverBudget = totalTripCost > targetBudget;
  const overBudgetAmount = isOverBudget ? totalTripCost - targetBudget : 0;
  const percentageUsed =
    targetBudget > 0
      ? Number(((totalTripCost / targetBudget) * 100).toFixed(1))
      : 0;

  const costPerDay =
    durationDays > 0
      ? Math.round(totalTripCost / durationDays)
      : totalTripCost;

  const dailyBudget =
    durationDays > 0 && targetBudget > 0
      ? Math.round(targetBudget / durationDays)
      : targetBudget;

  // Determine Health Status
  let healthStatus: BudgetHealthStatus = "under_budget";
  if (isOverBudget) {
    healthStatus = "over_budget";
  } else if (percentageUsed >= 90) {
    healthStatus = "warning";
  } else if (percentageUsed >= 60) {
    healthStatus = "on_track";
  } else {
    healthStatus = "under_budget";
  }

  // 4. Build Category Breakdown List
  const categoryBreakdown: CategoryCostItem[] = Array.from(
    categoryTotals.entries()
  )
    .map(([catName, data]) => ({
      category: catName,
      amount: data.total,
      percentageOfTotal:
        totalTripCost > 0
          ? Number(((data.total / totalTripCost) * 100).toFixed(1))
          : 0,
      count: data.count,
      color: getCategoryColor(catName),
    }))
    .sort((a, b) => b.amount - a.amount);

  // 5. Build Daily Breakdown List
  const startDate = new Date(trip.start_date);
  const dailyBreakdown: DailyCostItem[] = Array.from(dayTotals.entries())
    .sort(([dayA], [dayB]) => dayA - dayB)
    .map(([dayNum, data]) => {
      let dateStr: string | undefined;
      let formattedDate = `Day ${dayNum}`;

      if (!isNaN(startDate.getTime())) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + (dayNum - 1));
        dateStr = d.toISOString().split("T")[0];
        formattedDate = d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      }

      return {
        dayNumber: dayNum,
        date: dateStr,
        formattedDate,
        amount: data.amount,
        percentageOfBudget:
          dailyBudget > 0
            ? Number(((data.amount / dailyBudget) * 100).toFixed(1))
            : 0,
        activitiesCount: data.count,
        cityName: data.cityName,
      };
    });

  // 6. Build City Breakdown List
  const cityBreakdown: CityCostItem[] = Array.from(cityTotals.entries())
    .map(([cityId, data]) => ({
      cityId,
      cityName: data.name,
      amount: data.total,
      percentageOfTotal:
        totalTripCost > 0
          ? Number(((data.total / totalTripCost) * 100).toFixed(1))
          : 0,
      activityCount: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  // 7. Find Most Expensive Category
  const mostExpensiveCategory =
    categoryBreakdown.length > 0 && categoryBreakdown[0].amount > 0
      ? {
          category: categoryBreakdown[0].category,
          amount: categoryBreakdown[0].amount,
          percentage: categoryBreakdown[0].percentageOfTotal,
        }
      : null;

  // 8. Find Most Expensive Day
  const sortedDays = [...dailyBreakdown].sort((a, b) => b.amount - a.amount);
  const mostExpensiveDay =
    sortedDays.length > 0 && sortedDays[0].amount > 0
      ? {
          dayNumber: sortedDays[0].dayNumber,
          date: sortedDays[0].date,
          formattedDate: sortedDays[0].formattedDate,
          amount: sortedDays[0].amount,
          cityName: sortedDays[0].cityName,
        }
      : null;

  // Sort flat activities by cost descending for easy analysis
  flatActivities.sort((a, b) => b.cost - a.cost);

  return {
    total: totalTripCost,
    targetBudget,
    remaining,
    percentageUsed,
    isOverBudget,
    overBudgetAmount,
    costPerDay,
    dailyBudget,
    durationDays,
    healthStatus,
    categoryBreakdown,
    dailyBreakdown,
    cityBreakdown,
    activityCosts: flatActivities,
    mostExpensiveCategory,
    mostExpensiveDay,
  };
}
