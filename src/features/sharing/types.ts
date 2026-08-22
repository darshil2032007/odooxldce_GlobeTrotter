import type { TripWithDetails } from "@/types/database";

export interface PublicTripData {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  durationDays: number;
  coverImage?: string | null;
  shareSlug: string;
  isPublic: boolean;
  totalCost: number;
  destinations: {
    cityId: string;
    cityName: string;
    country: string;
    region?: string | null;
    imageUrl?: string | null;
    stopOrder: number;
  }[];
  days: {
    dayNumber: number;
    dateStr?: string;
    formattedDate: string;
    cityName?: string;
    totalDayCost: number;
    activities: {
      id: string;
      title: string;
      category: string;
      cost: number;
      scheduledTime?: string | null;
      durationHours?: number;
      notes?: string | null;
      cityName?: string;
      imageUrl?: string | null;
      description?: string | null;
    }[];
  }[];
}

export interface ShareSettings {
  isPublic: boolean;
  shareSlug: string | null;
  shareUrl: string;
}
