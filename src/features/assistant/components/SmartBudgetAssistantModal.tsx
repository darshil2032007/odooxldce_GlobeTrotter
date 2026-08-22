import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { getActivities } from "@/services/data/activities";
import { updateStopActivity } from "@/services/data/stopActivities";
import { generateBudgetSuggestions } from "@/features/budget/engine/assistantEngine";
import { getAIBudgetExplanation } from "@/services/ai/budgetExplanation";
import type { TripWithDetails } from "@/types/database";
import type { TripBudgetCalculation } from "@/features/budget/types";
import type { BudgetSuggestion } from "../types";
import { toast } from "sonner";

interface SmartBudgetAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: TripWithDetails;
  budget: TripBudgetCalculation;
  onApplied?: () => void;
}

export function SmartBudgetAssistantModal({
  open,
  onOpenChange,
  trip,
  budget,
  onApplied,
}: SmartBudgetAssistantModalProps) {
  const queryClient = useQueryClient();
  const [applyingSuggestionId, setApplyingSuggestionId] = useState<string | null>(null);

  // Fetch catalog activities for relevant cities in the trip
  const cityIds = (trip.stops || []).map((s) => s.city_id);

  const { data: catalogActivities = [], isLoading: isLoadingCatalog } = useQuery({
    queryKey: ["assistant-catalog-activities", cityIds],
    queryFn: async () => {
      // Fetch all activities
      const acts = await getActivities();
      return acts;
    },
    enabled: open,
  });

  const analysis = generateBudgetSuggestions(
    trip,
    budget,
    catalogActivities
  );

  const { data: aiExplanation, isLoading: isLoadingAIExplanation } = useQuery({
    queryKey: ["ai-budget-explanation", trip.id, budget.total, budget.targetBudget],
    queryFn: async () => {
      return await getAIBudgetExplanation(analysis);
    },
    enabled: open,
    staleTime: 1000 * 60 * 5,
  });

  const applyReplacementMutation = useMutation({
    mutationFn: async (suggestion: BudgetSuggestion) => {
      if (!suggestion.activityToReplace) {
        throw new Error("No activity selected for replacement");
      }

      const stopActId = suggestion.activityToReplace.stopActivityId;
      const repl = suggestion.replacementActivity;

      if (repl) {
        // Swap activity with new catalog activity
        await updateStopActivity(stopActId, {
          activity_id: repl.id,
          cost: repl.estimatedCost,
          notes: `Replaced with ${repl.title} via Smart Budget Assistant`,
        });
      } else {
        // Reduced/Free alternative
        await updateStopActivity(stopActId, {
          cost: suggestion.suggestedCost,
          notes: suggestion.title,
        });
      }
    },
    onSuccess: (_, suggestion) => {
      toast.success(
        `Applied! Saved ${formatCurrency(suggestion.savings)}. Budget updated.`
      );
      queryClient.invalidateQueries({ queryKey: ["trip", trip.id] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      onApplied?.();
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to apply suggestion"
      );
    },
    onSettled: () => {
      setApplyingSuggestionId(null);
    },
  });

  const handleApply = async (suggestion: BudgetSuggestion) => {
    setApplyingSuggestionId(suggestion.id);
    await applyReplacementMutation.mutateAsync(suggestion);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto p-0 gap-0 border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950">
        {/* Header with gradient badge */}
        <div className="relative overflow-hidden p-6 pb-5 bg-gradient-to-br from-surface-900 via-surface-950 to-primary-950 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-400/20 p-2.5 text-amber-300 ring-1 ring-amber-400/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-white font-[var(--font-display)]">
                  Smart Budget Assistant
                </DialogTitle>
                <p className="text-xs text-surface-300">
                  Deterministic AI recommendations to eliminate budget deficits
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-amber-400/40 bg-amber-400/10 text-amber-300 text-xs py-1"
            >
              Rule-Based Intelligence
            </Badge>
          </div>

          {/* Analysis Summary Box */}
          <div className="mt-5 rounded-xl bg-white/10 p-4 backdrop-blur-md border border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              {analysis.isOverBudget ? (
                <div className="flex items-center gap-1.5 text-rose-300 font-bold text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Budget Alert: {formatCurrency(analysis.deficit)} Over Limit</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Budget is on Track</span>
                </div>
              )}
            </div>
            <p className="text-xs text-white/90 leading-relaxed bg-black/20 p-2.5 rounded-lg border border-white/10">
              {isLoadingAIExplanation ? (
                <span className="flex items-center gap-1.5 text-amber-300">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Generating Gemini AI financial explanation...
                </span>
              ) : (
                aiExplanation || analysis.summaryMessage
              )}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[11px] text-surface-300">
              <div>
                <span className="text-white/60">Target: </span>
                <strong className="text-white font-semibold">
                  {formatCurrency(analysis.targetBudget)}
                </strong>
              </div>
              <div>
                <span className="text-white/60">Current Total: </span>
                <strong className="text-white font-semibold">
                  {formatCurrency(analysis.currentCost)}
                </strong>
              </div>
              {analysis.mostExpensiveCategory && (
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-white/60">Top Category: </span>
                  <strong className="text-white font-semibold">
                    {analysis.mostExpensiveCategory.category}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Suggestions Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-emerald-500" />
              Recommended Swaps & Optimizations ({analysis.suggestions.length})
            </h4>
            {analysis.totalPotentialSavings > 0 && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Max Potential Saving: {formatCurrency(analysis.totalPotentialSavings)}
              </span>
            )}
          </div>

          {isLoadingCatalog ? (
            <div className="flex flex-col items-center justify-center py-10 text-surface-400 text-xs">
              <RefreshCw className="h-6 w-6 animate-spin mb-2 text-primary-500" />
              <span>Scanning catalog for cheaper alternatives...</span>
            </div>
          ) : analysis.suggestions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-surface-200 dark:border-surface-800 p-8 text-center space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-surface-800 dark:text-surface-200">
                No major optimizations needed
              </p>
              <p className="text-xs text-surface-500 max-w-sm mx-auto">
                All scheduled activities are already budget-friendly and aligned with your target budget.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {analysis.suggestions.map((suggestion) => {
                const isApplying = applyingSuggestionId === suggestion.id;
                const solvesDeficit = suggestion.impact === "solves_deficit";

                return (
                  <div
                    key={suggestion.id}
                    className={`rounded-2xl border p-4 transition-all duration-200 ${
                      solvesDeficit
                        ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/10 shadow-sm"
                        : "border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900"
                    }`}
                  >
                    {/* Badge & Impact Header */}
                    <div className="flex items-center justify-between gap-2 pb-2.5">
                      <div className="flex items-center gap-2">
                        {solvesDeficit ? (
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold">
                            ✨ Solves Budget Deficit
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold text-primary-600 border-primary-500/30"
                          >
                            Cost Optimization
                          </Badge>
                        )}
                        <span className="text-xs text-surface-400">
                          {suggestion.activityToReplace?.cityName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                        <span>Save {formatCurrency(suggestion.savings)}</span>
                      </div>
                    </div>

                    {/* Comparison Side by Side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-surface-50 dark:bg-surface-800/40 p-3 text-xs border border-surface-200/60 dark:border-surface-800">
                      {/* Current Activity */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-500">
                          Current Activity
                        </span>
                        <div className="font-bold text-surface-900 dark:text-surface-100 line-clamp-1">
                          {suggestion.activityToReplace?.title}
                        </div>
                        <div className="flex items-center justify-between text-surface-500">
                          <span>{suggestion.activityToReplace?.category}</span>
                          <span className="font-semibold text-rose-600 dark:text-rose-400">
                            {formatCurrency(suggestion.currentCost)}
                          </span>
                        </div>
                      </div>

                      {/* Suggested Alternative */}
                      <div className="space-y-1 sm:border-l sm:border-surface-200 sm:dark:border-surface-700 sm:pl-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Suggested Replacement
                        </span>
                        <div className="font-bold text-surface-900 dark:text-surface-100 line-clamp-1">
                          {suggestion.replacementActivity
                            ? suggestion.replacementActivity.title
                            : "Self-Guided Alternative"}
                        </div>
                        <div className="flex items-center justify-between text-surface-500">
                          <span>
                            {suggestion.replacementActivity
                              ? suggestion.replacementActivity.category
                              : "Free Exploration"}
                          </span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {suggestion.suggestedCost === 0
                              ? "FREE (₹0)"
                              : formatCurrency(suggestion.suggestedCost)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reasoning & Actions Footer */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3">
                      <p className="text-[11px] text-surface-500 leading-snug">
                        {suggestion.reasoning}
                      </p>

                      <Button
                        size="sm"
                        onClick={() => handleApply(suggestion)}
                        disabled={isApplying || applyReplacementMutation.isPending}
                        className="w-full sm:w-auto shrink-0 gap-1.5 text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white"
                      >
                        {isApplying ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Apply Replacement
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
