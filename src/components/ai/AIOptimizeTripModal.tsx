import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Clock,
  ThumbsDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getAIOptimizationSuggestions,
  applyOptimizationSuggestion,
} from "@/services/ai/optimizer";
import type { AIOptimizationSuggestion } from "@/services/ai/schemas/optimization";
import type { TripWithDetails } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface AIOptimizeTripModalProps {
  trip: TripWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplied?: () => void;
}

const OPTIMIZATION_GOALS = [
  "Make this trip cheaper to reduce budget deficit",
  "Reduce pace and make the schedule more relaxed",
  "Add more local cultural and authentic food experiences",
  "Balance activity durations across all days",
];

export function AIOptimizeTripModal({
  trip,
  open,
  onOpenChange,
  onApplied,
}: AIOptimizeTripModalProps) {
  const queryClient = useQueryClient();
  const [selectedGoal, setSelectedGoal] = useState(OPTIMIZATION_GOALS[0]);
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const {
    data: optimization,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["ai-optimization", trip.id, selectedGoal],
    queryFn: async () => {
      return await getAIOptimizationSuggestions(trip, selectedGoal);
    },
    enabled: open,
    staleTime: 1000 * 60 * 5,
  });

  const applyMutation = useMutation({
    mutationFn: async (suggestion: AIOptimizationSuggestion) => {
      setApplyingId(suggestion.id);
      await applyOptimizationSuggestion(trip, suggestion);
    },
    onSuccess: (_, suggestion) => {
      toast.success(`Applied optimization: ${suggestion.title}`);
      queryClient.invalidateQueries({ queryKey: ["trip", trip.id] });
      queryClient.invalidateQueries({ queryKey: ["trip-details", trip.id] });
      setRejectedIds((prev) => new Set(prev).add(suggestion.id));
      if (onApplied) onApplied();
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to apply optimization"
      );
    },
    onSettled: () => {
      setApplyingId(null);
    },
  });

  const handleReject = (id: string) => {
    setRejectedIds((prev) => new Set(prev).add(id));
    toast.info("Suggestion dismissed");
  };

  const activeSuggestions = (optimization?.suggestions || []).filter(
    (s) => !rejectedIds.has(s.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-surface-900 via-surface-950 to-indigo-950 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-400/20 p-2.5 text-amber-300 ring-1 ring-amber-400/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-white font-[var(--font-display)]">
                  Optimize My Trip
                </DialogTitle>
                <p className="text-xs text-surface-300">
                  Gemini AI itinerary rebalancing & cost reduction suggestions
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-amber-400/40 bg-amber-400/10 text-amber-300 text-xs py-1"
            >
              Gemini AI
            </Badge>
          </div>

          {/* Goal Selector Chips */}
          <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
            <span className="text-[11px] font-semibold text-surface-300 uppercase tracking-wider block">
              Optimization Goal
            </span>
            <div className="flex flex-wrap gap-1.5">
              {OPTIMIZATION_GOALS.map((goal, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedGoal(goal)}
                  className={`text-xs rounded-full px-3 py-1 font-medium transition-all ${
                    selectedGoal === goal
                      ? "bg-amber-400 text-surface-950 font-bold shadow-sm"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isLoading || isRefetching ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary-500" />
              <p className="text-xs font-semibold text-surface-600 dark:text-surface-300">
                Analyzing itinerary pace, costs, and geographic distribution...
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Summary Card */}
              {optimization && (
                <div className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-surface-900 dark:text-surface-100">
                    <span>AI Optimization Strategy</span>
                    {optimization.expectedTotalSavings > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <TrendingDown className="h-3.5 w-3.5" />
                        Est. Savings: {formatCurrency(optimization.expectedTotalSavings)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed">
                    {optimization.summary}
                  </p>
                  {optimization.paceImprovement && (
                    <div className="text-[11px] text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1.5 pt-1">
                      <Clock className="h-3.5 w-3.5" />
                      {optimization.paceImprovement}
                    </div>
                  )}
                </div>
              )}

              {/* Suggestions List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500">
                  Recommended Action Items ({activeSuggestions.length})
                </h4>

                {activeSuggestions.length === 0 ? (
                  <div className="py-8 text-center rounded-xl bg-surface-100/60 dark:bg-surface-900/40 p-4 border border-dashed border-surface-200 dark:border-surface-800">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-surface-800 dark:text-surface-200">
                      All suggestions reviewed!
                    </p>
                    <p className="text-[11px] text-surface-500 mt-0.5">
                      Your itinerary aligns smoothly with the selected goal.
                    </p>
                  </div>
                ) : (
                  activeSuggestions.map((suggestion) => (
                    <Card
                      key={suggestion.id}
                      className="border-surface-200 dark:border-surface-800 shadow-sm bg-white dark:bg-surface-900 overflow-hidden"
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-surface-900 dark:text-surface-100">
                                {suggestion.title}
                              </h5>
                              <Badge
                                variant="outline"
                                className="text-[9px] py-0 capitalize"
                              >
                                {suggestion.type.replace("_", " ")}
                              </Badge>
                            </div>
                            {suggestion.dayNumber && (
                              <span className="text-[11px] text-surface-500 block">
                                Day {suggestion.dayNumber} • {suggestion.cityName || "Trip"}
                              </span>
                            )}
                          </div>

                          {suggestion.estimatedCostDifference < 0 && (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                              Save {formatCurrency(Math.abs(suggestion.estimatedCostDifference))}
                            </span>
                          )}
                        </div>

                        {/* Comparison display */}
                        {suggestion.currentActivityTitle && suggestion.replacementActivityTitle && (
                          <div className="rounded-xl bg-surface-50 dark:bg-surface-800/40 p-2.5 border border-surface-100 dark:border-surface-800 flex items-center justify-between text-xs">
                            <span className="line-through text-surface-500">
                              {suggestion.currentActivityTitle}
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-primary-500 shrink-0 mx-2" />
                            <span className="font-semibold text-primary-600 dark:text-primary-400">
                              {suggestion.replacementActivityTitle}
                            </span>
                          </div>
                        )}

                        <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed">
                          {suggestion.reason}
                        </p>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-surface-100 dark:border-surface-800">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReject(suggestion.id)}
                            disabled={applyingId === suggestion.id}
                            className="text-xs text-surface-500 hover:text-danger-600 gap-1 h-8"
                          >
                            <ThumbsDown className="h-3 w-3" />
                            Dismiss
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => applyMutation.mutate(suggestion)}
                            disabled={applyingId === suggestion.id}
                            className="text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white gap-1.5 h-8 px-3.5 shadow-sm"
                          >
                            {applyingId === suggestion.id ? (
                              <>
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                Applying...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Apply Change
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
