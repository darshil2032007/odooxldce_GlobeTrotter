import { useState } from "react";
import {
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoredDestinationCard } from "./ScoredDestinationCard";
import { useRecommendations } from "../hooks/useRecommendations";
import type { TravelStyle, ScoredDestination, UserPreferences } from "../types";
import { formatCurrency } from "@/lib/utils";

const INTEREST_TAGS = [
  "Culture",
  "Adventure",
  "Beach",
  "Nature",
  "Food",
  "History",
  "Relaxation",
  "Sightseeing",
  "Romance",
  "Nightlife",
];

const TRAVEL_STYLES: { id: TravelStyle; label: string }[] = [
  { id: "backpacker", label: "Backpacker" },
  { id: "budget", label: "Budget" },
  { id: "moderate", label: "Moderate" },
  { id: "luxury", label: "Luxury" },
];

interface DestinationRecommenderProps {
  onSelectDestination?: (dest: ScoredDestination) => void;
}

export function DestinationRecommender({
  onSelectDestination,
}: DestinationRecommenderProps) {
  const { preferences, setPreferences, rankedDestinations, isLoading } =
    useRecommendations();

  const [showFilters, setShowFilters] = useState(false);

  const toggleInterest = (tag: string) => {
    setPreferences((prev: UserPreferences) => {
      const exists = prev.interests.includes(tag);
      const nextInterests = exists
        ? prev.interests.filter((t: string) => t !== tag)
        : [...prev.interests, tag];
      return { ...prev, interests: nextInterests };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Filter Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-primary-500/10 p-2 text-primary-600 dark:text-primary-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-surface-900 dark:text-surface-100 font-[var(--font-display)]">
                AI Destination Recommendations
              </h2>
              <p className="text-xs text-surface-500">
                Deterministic algorithmic matching based on your budget, style & interests
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2 self-start sm:self-auto text-xs font-semibold"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {showFilters ? "Hide Preferences" : "Customize Preferences"}
        </Button>
      </div>

      {/* Interactive Preferences Panel */}
      {showFilters && (
        <Card className="rounded-2xl border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Target Budget Slider / Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-surface-700 dark:text-surface-300">
                  Target Trip Budget
                </span>
                <span className="text-primary-600 dark:text-primary-400 font-bold">
                  {formatCurrency(preferences.targetBudget)}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="250000"
                step="5000"
                value={preferences.targetBudget}
                onChange={(e) =>
                  setPreferences((prev: UserPreferences) => ({
                    ...prev,
                    targetBudget: Number(e.target.value),
                  }))
                }
                className="w-full h-1.5 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-[10px] text-surface-400">
                <span>₹10k</span>
                <span>₹100k</span>
                <span>₹250k</span>
              </div>
            </div>

            {/* Duration Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-surface-700 dark:text-surface-300">
                  Trip Duration
                </span>
                <span className="text-primary-600 dark:text-primary-400 font-bold">
                  {preferences.durationDays} Days
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="21"
                step="1"
                value={preferences.durationDays}
                onChange={(e) =>
                  setPreferences((prev: UserPreferences) => ({
                    ...prev,
                    durationDays: Number(e.target.value),
                  }))
                }
                className="w-full h-1.5 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-[10px] text-surface-400">
                <span>2 Days</span>
                <span>7 Days</span>
                <span>21 Days</span>
              </div>
            </div>

            {/* Travel Style */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-surface-700 dark:text-surface-300 block">
                Travel Style
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {TRAVEL_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() =>
                      setPreferences((prev: UserPreferences) => ({
                        ...prev,
                        travelStyle: style.id,
                      }))
                    }
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-all ${
                      preferences.travelStyle === style.id
                        ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                        : "bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border-surface-200 dark:border-surface-700 hover:border-surface-300"
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interests Tags */}
          <div className="pt-4 mt-4 border-t border-surface-200 dark:border-surface-800">
            <span className="text-xs font-semibold text-surface-700 dark:text-surface-300 block mb-2">
              Interests & Themes (Multi-select)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {INTEREST_TAGS.map((tag) => {
                const isSelected = preferences.interests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-primary-500/15 text-primary-700 dark:text-primary-300 border-primary-500/40 ring-1 ring-primary-500/30"
                        : "bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 border-surface-200 dark:border-surface-700 hover:border-surface-300"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Results Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-surface-400 text-xs">
          <RefreshCw className="h-6 w-6 animate-spin text-primary-500 mb-2" />
          <span>Computing recommendation scores...</span>
        </div>
      ) : rankedDestinations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-200 dark:border-surface-800 p-8 text-center text-sm text-surface-400">
          No destinations available in the catalog.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rankedDestinations.slice(0, 4).map((destination) => (
            <ScoredDestinationCard
              key={destination.city.id}
              destination={destination}
              onSelect={onSelectDestination}
            />
          ))}
        </div>
      )}
    </div>
  );
}
