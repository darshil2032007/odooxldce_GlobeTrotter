/**
 * Mock data for UI development.
 * TODO: Remove/replace with real Supabase queries once Dev 2 provides the data layer.
 * All mock data is isolated in this single file for easy cleanup.
 */

import type { TripCardData, BudgetSummary, RecommendedDestination } from "@/types";

export const MOCK_TRIPS: TripCardData[] = [
  {
    id: "trip-1",
    name: "European Summer Adventure",
    description: "A three-week journey through the best of Western Europe — Paris, Barcelona, and Rome.",
    startDate: "2026-09-15",
    endDate: "2026-10-06",
    coverImage: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80",
    destinationCount: 3,
    budgetTarget: 5000,
    budgetSpent: 1250,
    status: "upcoming",
    createdAt: "2026-08-01",
  },
  {
    id: "trip-2",
    name: "Tokyo & Kyoto Explorer",
    description: "Immerse yourself in Japanese culture — from neon-lit Shibuya to serene Arashiyama bamboo groves.",
    startDate: "2026-11-01",
    endDate: "2026-11-14",
    coverImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    destinationCount: 2,
    budgetTarget: 4000,
    budgetSpent: 800,
    status: "upcoming",
    createdAt: "2026-08-10",
  },
  {
    id: "trip-3",
    name: "Bali Wellness Retreat",
    description: "Relax and recharge with yoga, surfing, and rice terrace hikes across Ubud and Seminyak.",
    startDate: "2026-07-01",
    endDate: "2026-07-12",
    coverImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    destinationCount: 2,
    budgetTarget: 2500,
    budgetSpent: 2350,
    status: "completed",
    createdAt: "2026-05-20",
  },
  {
    id: "trip-4",
    name: "NYC Weekend Getaway",
    description: "Fast-paced long weekend in the city that never sleeps — Broadway, Central Park, and the best pizza.",
    startDate: "2026-08-22",
    endDate: "2026-08-25",
    coverImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    destinationCount: 1,
    budgetTarget: 1500,
    budgetSpent: 600,
    status: "ongoing",
    createdAt: "2026-08-15",
  },
  {
    id: "trip-5",
    name: "Moroccan Desert & Coast",
    description: "From the Sahara dunes of Merzouga to the blue streets of Chefchaouen and coastal Essaouira.",
    startDate: "2027-01-10",
    endDate: "2027-01-24",
    coverImage: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80",
    destinationCount: 4,
    budgetTarget: 3000,
    budgetSpent: 0,
    status: "draft",
    createdAt: "2026-08-18",
  },
];

export const MOCK_BUDGET_SUMMARY: BudgetSummary = {
  totalBudget: 16000,
  totalSpent: 5000,
  totalRemaining: 11000,
  tripCount: 5,
};

export const MOCK_RECOMMENDED_DESTINATIONS: RecommendedDestination[] = [
  {
    id: "dest-1",
    name: "Santorini",
    country: "Greece",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&q=80",
    averageCost: 2200,
    rating: 4.8,
    tags: ["Beach", "Romance", "Photography"],
  },
  {
    id: "dest-2",
    name: "Kyoto",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80",
    averageCost: 1800,
    rating: 4.9,
    tags: ["Culture", "Nature", "History"],
  },
  {
    id: "dest-3",
    name: "Banff",
    country: "Canada",
    image: "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=400&q=80",
    averageCost: 1500,
    rating: 4.7,
    tags: ["Mountains", "Adventure", "Nature"],
  },
  {
    id: "dest-4",
    name: "Amalfi Coast",
    country: "Italy",
    image: "https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=400&q=80",
    averageCost: 2500,
    rating: 4.8,
    tags: ["Coastal", "Food", "Luxury"],
  },
];
