import type {
  Trip,
  StopWithDetails,
  StopActivityWithDetails,
  City,
} from "@/types/database";

export type {
  Trip,
  StopWithDetails,
  StopActivityWithDetails,
  City,
};

export interface ItineraryValidationIssue {
  type: "overlap" | "out_of_dates" | "city_mismatch" | "invalid_stop_dates";
  severity: "warning" | "error";
  message: string;
  dayNumber?: number;
  stopId?: string;
  activityId?: string;
}

export interface DayPlan {
  dayNumber: number;
  dateStr?: string; // Formatted date string, e.g. "2026-09-10"
  formattedDate: string; // e.g. "Thu, Sep 10, 2026"
  stop?: StopWithDetails;
  city?: City;
  activities: StopActivityWithDetails[];
  totalDayCost: number;
  validationIssues: ItineraryValidationIssue[];
}

export interface ItinerarySummaryData {
  totalActivityCost: number;
  costPerDay: {
    dayNumber: number;
    date: string;
    totalCost: number;
    activityCount: number;
  }[];
  costPerCity: {
    cityId: string;
    cityName: string;
    totalCost: number;
    activityCount: number;
  }[];
  costByCategory: {
    category: string;
    totalCost: number;
    count: number;
  }[];
  totalActivitiesCount: number;
  completedActivitiesCount: number;
  activities: {
    id: string;
    stopId: string;
    cityId?: string;
    cityName?: string;
    title: string;
    category: string;
    dayNumber: number;
    scheduledTime?: string | null;
    cost: number;
    isCompleted: boolean;
    notes?: string | null;
  }[];
}
