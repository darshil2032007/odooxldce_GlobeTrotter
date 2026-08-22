export type CoreBudgetCategory =
  | "Activities"
  | "Transport"
  | "Accommodation"
  | "Food"
  | "Other";

export interface CategoryCostItem {
  category: string;
  amount: number;
  percentageOfTotal: number;
  count: number;
  color: string;
}

export interface DailyCostItem {
  dayNumber: number;
  date?: string;
  formattedDate: string;
  amount: number;
  percentageOfBudget: number;
  activitiesCount: number;
  cityName?: string;
}

export interface ActivityCostItem {
  id: string;
  stopId: string;
  activityId?: string | null;
  title: string;
  cost: number;
  category: string;
  dayNumber: number;
  cityName: string;
  cityId?: string;
  isCompleted: boolean;
  scheduledTime?: string | null;
  notes?: string | null;
}

export interface CityCostItem {
  cityId: string;
  cityName: string;
  amount: number;
  percentageOfTotal: number;
  activityCount: number;
}

export type BudgetHealthStatus =
  | "under_budget"
  | "on_track"
  | "warning"
  | "over_budget";

export interface TripBudgetCalculation {
  total: number;
  targetBudget: number;
  remaining: number; // positive = under budget, negative = over budget
  percentageUsed: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  costPerDay: number;
  dailyBudget: number;
  durationDays: number;
  healthStatus: BudgetHealthStatus;
  categoryBreakdown: CategoryCostItem[];
  dailyBreakdown: DailyCostItem[];
  cityBreakdown: CityCostItem[];
  activityCosts: ActivityCostItem[];
  mostExpensiveCategory: {
    category: string;
    amount: number;
    percentage: number;
  } | null;
  mostExpensiveDay: {
    dayNumber: number;
    date?: string;
    formattedDate: string;
    amount: number;
    cityName?: string;
  } | null;
}
