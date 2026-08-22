import { useState } from "react";
import { MapPin, Sparkles, Compass, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { getAIDestinationExplanation } from "@/services/ai/recommendationExplanation";
import type { ScoredDestination, UserPreferences } from "../types";
import { Link } from "react-router-dom";

interface ScoredDestinationCardProps {
  destination: ScoredDestination;
  preferences?: UserPreferences;
  onSelect?: (destination: ScoredDestination) => void;
}

export function ScoredDestinationCard({
  destination,
  preferences,
  onSelect,
}: ScoredDestinationCardProps) {
  const { city, score, breakdown, estimatedTotalCost, estimatedDailyCost, matchingInterests } = destination;
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isAIExpanded, setIsAIExpanded] = useState(false);

  const handleFetchAIExplanation = async () => {
    if (aiExplanation) {
      setIsAIExpanded(!isAIExpanded);
      return;
    }
    setIsLoadingAI(true);
    setIsAIExpanded(true);
    try {
      const expl = await getAIDestinationExplanation(
        destination,
        preferences || {
          targetBudget: estimatedTotalCost,
          durationDays: 5,
          travelStyle: "moderate",
          interests: matchingInterests,
        }
      );
      setAiExplanation(expl);
    } catch {
      setAiExplanation(
        `${city.name} fits your selected travel criteria with a ${score}% compatibility score.`
      );
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getScoreColor = () => {
    if (score >= 85) return "text-emerald-500 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 70) return "text-primary-500 border-primary-500/30 bg-primary-500/10";
    return "text-amber-500 border-amber-500/30 bg-amber-500/10";
  };

  return (
    <Card className="group overflow-hidden rounded-2xl border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col">
      {/* Cover Image Header */}
      <div className="relative h-44 w-full overflow-hidden bg-surface-800">
        <img
          src={
            city.image_url ||
            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80"
          }
          alt={city.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Match Score Badge */}
        <div className="absolute top-3 right-3">
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-bold text-xs shadow-md backdrop-blur-md border ${getScoreColor()}`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{score}% Match</span>
          </div>
        </div>

        {/* City & Country bottom left */}
        <div className="absolute bottom-3 left-3 text-white">
          <div className="flex items-center gap-1 text-xs text-accent-300 font-medium">
            <MapPin className="h-3.5 w-3.5" />
            <span>{city.country}</span>
            {city.region && <span>• {city.region}</span>}
          </div>
          <h3 className="text-lg font-extrabold tracking-tight font-[var(--font-display)]">
            {city.name}
          </h3>
        </div>
      </div>

      {/* Body Content */}
      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Estimated Costs */}
        <div className="flex items-baseline justify-between border-b border-surface-100 dark:border-surface-800/80 pb-3">
          <div>
            <span className="text-xs text-surface-400">Estimated Total</span>
            <div className="text-lg font-extrabold text-surface-900 dark:text-surface-100">
              {formatCurrency(estimatedTotalCost)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-surface-400">Daily Pace</span>
            <div className="text-sm font-semibold text-surface-700 dark:text-surface-300">
              {formatCurrency(estimatedDailyCost)}/day
            </div>
          </div>
        </div>

        {/* Scoring Breakdown Meters */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-[11px] text-surface-500">
            <span>Budget Fit: {(breakdown.budgetMatch * 100).toFixed(0)}%</span>
            <span>Interest Fit: {(breakdown.interestMatch * 100).toFixed(0)}%</span>
            <span>Popularity: {(breakdown.popularity * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800 flex">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${breakdown.budgetMatch * 35}%` }}
              title="Budget Weight (35%)"
            />
            <div
              className="bg-primary-500 h-full"
              style={{ width: `${breakdown.interestMatch * 35}%` }}
              title="Interest Weight (35%)"
            />
            <div
              className="bg-indigo-500 h-full"
              style={{ width: `${breakdown.durationMatch * 15}%` }}
              title="Duration Weight (15%)"
            />
            <div
              className="bg-amber-500 h-full"
              style={{ width: `${breakdown.popularity * 15}%` }}
              title="Popularity Weight (15%)"
            />
          </div>
        </div>

        {/* Matching Interest Tags */}
        {matchingInterests.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {matchingInterests.map((interest: string) => (
              <Badge
                key={interest}
                variant="outline"
                className="text-[10px] py-0 px-2 bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-300 border-surface-200 dark:border-surface-700"
              >
                {interest}
              </Badge>
            ))}
          </div>
        )}

        {/* Gemini AI Match Reasoning Accordion */}
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-2 text-xs space-y-1.5">
          <button
            type="button"
            onClick={handleFetchAIExplanation}
            className="w-full flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Why this matches you (Gemini AI)
            </span>
            {isLoadingAI ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : isAIExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          {isAIExpanded && (
            <div className="text-[11px] text-surface-700 dark:text-surface-300 leading-relaxed pt-1 border-t border-amber-400/10">
              {isLoadingAI ? (
                <span className="italic text-surface-400">
                  Synthesizing personalized match reasoning...
                </span>
              ) : (
                aiExplanation
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {onSelect ? (
            <Button
              onClick={() => onSelect(destination)}
              className="w-full text-xs font-semibold gap-1.5 bg-surface-900 hover:bg-surface-800 text-white dark:bg-surface-100 dark:text-surface-900 dark:hover:bg-surface-200"
              size="sm"
            >
              <Compass className="h-3.5 w-3.5" />
              Plan Trip to {city.name}
            </Button>
          ) : (
            <Button
              asChild
              className="w-full text-xs font-semibold gap-1.5 bg-surface-900 hover:bg-surface-800 text-white dark:bg-surface-100 dark:text-surface-900 dark:hover:bg-surface-200"
              size="sm"
            >
              <Link to={`/trips/new?city=${city.id}`}>
                <Compass className="h-3.5 w-3.5" />
                Plan Trip to {city.name}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
