/**
 * Frontend-facing type definitions for GlobeTrotter AI.
 *
 * These are lightweight UI types used for rendering.
 * Once Developer 2 provides shared database types, prefer importing
 * from the shared types directory and mapping as needed.
 */

export type TripStatus = "upcoming" | "ongoing" | "completed" | "draft";

export interface TripCardData {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  destinationCount: number;
  budgetTarget: number;
  budgetSpent: number;
  status: TripStatus;
  createdAt: string;
}

export interface CreateTripFormValues {
  name: string;
  startDate: Date;
  endDate: Date;
  description: string;
  targetBudget: number;
  coverImage?: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  tripCount: number;
}

export interface RecommendedDestination {
  id: string;
  name: string;
  country: string;
  image: string;
  averageCost: number;
  rating: number;
  tags: string[];
}

export interface QuickActionItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  href: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}
