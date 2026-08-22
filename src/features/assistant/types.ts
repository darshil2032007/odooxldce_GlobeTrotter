export type SuggestionType =
  | "replace_activity"
  | "free_alternative"
  | "reduce_cost"
  | "category_warning";

export type SuggestionImpact =
  | "solves_deficit"
  | "major_saving"
  | "moderate_saving";

export interface ActivityToReplace {
  stopActivityId: string;
  stopId: string;
  activityId?: string | null;
  title: string;
  cost: number;
  dayNumber: number;
  cityName: string;
  cityId?: string;
  category: string;
}

export interface ReplacementActivityOption {
  id: string;
  title: string;
  estimatedCost: number;
  category: string;
  cityName: string;
  cityId: string;
  durationHours?: number;
  imageUrl?: string | null;
  description?: string | null;
}

export interface BudgetSuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  currentCost: number;
  suggestedCost: number;
  savings: number;
  reasoning: string;
  impact: SuggestionImpact;
  activityToReplace?: ActivityToReplace;
  replacementActivity?: ReplacementActivityOption;
}

export interface SmartAssistantAnalysis {
  isOverBudget: boolean;
  targetBudget: number;
  currentCost: number;
  deficit: number;
  savingsNeeded: number;
  percentageUsed: number;
  mostExpensiveCategory: {
    category: string;
    amount: number;
    percentage: number;
  } | null;
  mostExpensiveDay: {
    dayNumber: number;
    amount: number;
    cityName?: string;
    formattedDate?: string;
  } | null;
  totalPotentialSavings: number;
  suggestions: BudgetSuggestion[];
  summaryMessage: string;
}
