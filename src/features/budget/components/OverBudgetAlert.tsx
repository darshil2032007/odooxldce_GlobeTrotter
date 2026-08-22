import { AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { TripBudgetCalculation } from "../types";

interface OverBudgetAlertProps {
  budget: TripBudgetCalculation;
  onOpenAssistant?: () => void;
}

export function OverBudgetAlert({ budget, onOpenAssistant }: OverBudgetAlertProps) {
  if (!budget.isOverBudget) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-surface-900/90 to-amber-950/30 p-5 shadow-lg backdrop-blur-md">
      {/* Glow highlight */}
      <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-rose-500/10 blur-2xl" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="rounded-xl bg-rose-500/20 p-2.5 text-rose-400 ring-1 ring-rose-500/30">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-white tracking-wide">
                Budget Alert: Over Target
              </h4>
              <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-semibold text-rose-300 border border-rose-500/30">
                +{formatCurrency(budget.overBudgetAmount)} Deficit
              </span>
            </div>
            <p className="text-sm text-surface-300">
              Your planned trip total of{" "}
              <span className="font-semibold text-white">
                {formatCurrency(budget.total)}
              </span>{" "}
              exceeds your{" "}
              <span className="font-semibold text-white">
                {formatCurrency(budget.targetBudget)}
              </span>{" "}
              budget by{" "}
              <span className="font-bold text-rose-400">
                {formatCurrency(budget.overBudgetAmount)}
              </span>{" "}
              ({budget.percentageUsed}% used).
            </p>
            {(budget.mostExpensiveCategory || budget.mostExpensiveDay) && (
              <div className="flex flex-wrap gap-2 pt-1 text-xs text-surface-400">
                {budget.mostExpensiveCategory && (
                  <span>
                    Top Expense:{" "}
                    <strong className="text-surface-200">
                      {budget.mostExpensiveCategory.category} (
                      {formatCurrency(budget.mostExpensiveCategory.amount)})
                    </strong>
                  </span>
                )}
                {budget.mostExpensiveDay && (
                  <>
                    <span>•</span>
                    <span>
                      Peak Day:{" "}
                      <strong className="text-surface-200">
                        Day {budget.mostExpensiveDay.dayNumber} (
                        {formatCurrency(budget.mostExpensiveDay.amount)})
                      </strong>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {onOpenAssistant && (
          <Button
            onClick={onOpenAssistant}
            className="w-full sm:w-auto shrink-0 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-surface-950 font-bold shadow-md hover:shadow-orange-500/20 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Smart Budget Assistant
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
