import type { City, Activity } from "@/types/database";
import type {
  UserPreferences,
  ScoredDestination,
  ScoreBreakdown,
  TravelStyle,
} from "../types";

/**
 * Travel style multipliers for daily cost estimation in INR.
 * Base cost = city.cost_index * styleMultiplier
 */
const TRAVEL_STYLE_MULTIPLIER: Record<TravelStyle, number> = {
  backpacker: 25, // Hostels, street food, public transport (e.g. ~₹1,500/day for cost_index 60)
  budget: 40,     // Budget hotels, cafes, mixed transport (e.g. ~₹2,400/day for cost_index 60)
  moderate: 75,   // 3-4 star hotels, restaurants, cabs (e.g. ~₹4,500/day for cost_index 60)
  luxury: 160,    // 5-star resorts, fine dining, private tours (e.g. ~₹9,600/day for cost_index 60)
};

/**
 * Deterministic Destination Recommendation Scoring Engine.
 *
 * Scoring Formula:
 * Total Score = (budgetMatch * 0.35) + (interestMatch * 0.35) + (durationMatch * 0.15) + (popularity * 0.15)
 *
 * Architecture:
 * Pure functional scoring pipeline designed so an ML model can plug in seamlessly.
 */
export function scoreDestination(
  city: City,
  cityActivities: Activity[],
  prefs: UserPreferences
): ScoredDestination {
  const duration = Math.max(1, prefs.durationDays || 1);
  const targetDailyBudget = prefs.targetBudget > 0 ? prefs.targetBudget / duration : 5000;

  // 1. Calculate Estimated Daily & Total Cost for this City
  const costIndex = city.cost_index || 50;
  const styleMultiplier = TRAVEL_STYLE_MULTIPLIER[prefs.travelStyle] || TRAVEL_STYLE_MULTIPLIER.moderate;
  const estimatedDailyCost = Math.round(costIndex * styleMultiplier);
  const estimatedTotalCost = estimatedDailyCost * duration;

  // 2. Compute Budget Match (0..1) - Weight: 0.35
  // Perfect score if estimated total cost is within or just slightly below target budget
  let budgetMatch = 0;
  if (prefs.targetBudget <= 0) {
    budgetMatch = 0.8;
  } else {
    const costRatio = estimatedDailyCost / Math.max(1, targetDailyBudget);
    if (costRatio <= 1.0) {
      // Comfortably within budget: higher score if it maximizes the budget effectively without leaving 90% unused
      budgetMatch = Math.max(0.7, 1.0 - (1.0 - costRatio) * 0.3);
    } else {
      // Over budget: penalty proportional to deficit
      const excessRatio = costRatio - 1.0;
      budgetMatch = Math.max(0, 1.0 - excessRatio * 1.5);
    }
  }

  // 3. Compute Interest Match (0..1) - Weight: 0.35
  const cityCategorySet = new Set<string>();
  cityActivities.forEach((act) => {
    if (act.category) cityCategorySet.add(act.category.toLowerCase().trim());
  });

  const cityText = `${city.name} ${city.country} ${city.region || ""} ${city.description || ""}`.toLowerCase();

  const matchingInterests: string[] = [];
  if (prefs.interests.length === 0) {
    // If no preference specified, give a baseline neutral match
    cityActivities.forEach((a) => {
      if (a.category && !matchingInterests.includes(a.category)) {
        matchingInterests.push(a.category);
      }
    });
  } else {
    for (const interest of prefs.interests) {
      const lowerInt = interest.toLowerCase().trim();
      const hasCategory = Array.from(cityCategorySet).some((cat) => cat.includes(lowerInt) || lowerInt.includes(cat));
      const hasTextMatch = cityText.includes(lowerInt);

      if (hasCategory || hasTextMatch) {
        matchingInterests.push(interest);
      }
    }
  }

  const interestMatch =
    prefs.interests.length > 0
      ? Math.min(1, matchingInterests.length / prefs.interests.length)
      : 0.85;

  // 4. Compute Duration Match (0..1) - Weight: 0.15
  // City tier/size heuristics
  let idealMinDays = 2;
  let idealMaxDays = 6;
  if (costIndex > 75 || city.popularity_score > 80) {
    idealMinDays = 3;
    idealMaxDays = 8;
  }

  let durationMatch = 1.0;
  if (duration < idealMinDays) {
    durationMatch = Math.max(0.4, 1.0 - (idealMinDays - duration) * 0.25);
  } else if (duration > idealMaxDays) {
    durationMatch = Math.max(0.6, 1.0 - (duration - idealMaxDays) * 0.08);
  }

  // 5. Popularity Score (0..1) - Weight: 0.15
  const popularity = Math.min(1, Math.max(0, (city.popularity_score || 50) / 100));

  // 6. Final Weighted Aggregation
  const totalScoreFraction =
    budgetMatch * 0.35 +
    interestMatch * 0.35 +
    durationMatch * 0.15 +
    popularity * 0.15;

  const totalScore = Math.min(100, Math.max(0, Math.round(totalScoreFraction * 100)));

  let fitLabel: ScoredDestination["fitLabel"] = "Fair Match";
  if (totalScore >= 88) {
    fitLabel = "Exceptional Match";
  } else if (totalScore >= 75) {
    fitLabel = "Great Match";
  } else if (totalScore >= 60) {
    fitLabel = "Good Match";
  }

  const breakdown: ScoreBreakdown = {
    budgetMatch: Number(budgetMatch.toFixed(2)),
    interestMatch: Number(interestMatch.toFixed(2)),
    durationMatch: Number(durationMatch.toFixed(2)),
    popularity: Number(popularity.toFixed(2)),
    totalScore,
  };

  return {
    city,
    score: totalScore,
    breakdown,
    estimatedTotalCost,
    estimatedDailyCost,
    matchingInterests,
    sampleActivities: cityActivities.slice(0, 3),
    fitLabel,
  };
}

/**
 * Score and rank a list of cities based on user preferences.
 */
export function rankDestinations(
  cities: City[],
  activities: Activity[],
  prefs: UserPreferences
): ScoredDestination[] {
  // Group activities by city_id
  const actsByCity = new Map<string, Activity[]>();
  for (const act of activities) {
    if (!actsByCity.has(act.city_id)) {
      actsByCity.set(act.city_id, []);
    }
    actsByCity.get(act.city_id)!.push(act);
  }

  const scored = cities.map((city) => {
    const cityActs = actsByCity.get(city.id) || [];
    return scoreDestination(city, cityActs, prefs);
  });

  // Sort descending by total score
  return scored.sort((a, b) => b.score - a.score);
}
