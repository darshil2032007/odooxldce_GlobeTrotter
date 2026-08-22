import { useState } from "react";
import {
  Wallet,
  TrendingUp,
  Calendar,
  Layers,
  Edit2,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import type { TripBudgetCalculation } from "../types";

interface BudgetSummaryCardProps {
  budget: TripBudgetCalculation;
  onUpdateBudget?: (amount: number) => Promise<unknown>;
  onOpenAssistant?: () => void;
}

export function BudgetSummaryCard({
  budget,
  onUpdateBudget,
  onOpenAssistant,
}: BudgetSummaryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(budget.targetBudget.toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const num = parseFloat(editValue);
    if (isNaN(num) || num < 0) return;
    if (onUpdateBudget) {
      setIsSaving(true);
      try {
        await onUpdateBudget(num);
        setIsEditing(false);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const getProgressColor = () => {
    if (budget.isOverBudget) return "bg-rose-500";
    if (budget.percentageUsed >= 90) return "bg-amber-500";
    if (budget.percentageUsed >= 60) return "bg-primary-500";
    return "bg-emerald-500";
  };

  const getBadgeStyle = () => {
    if (budget.isOverBudget) {
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
    }
    if (budget.percentageUsed >= 90) {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    }
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
  };

  return (
    <Card className="relative overflow-hidden shadow-card border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 backdrop-blur-sm">
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-primary-500/10 p-2 text-primary-600 dark:text-primary-400">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-surface-900 dark:text-surface-100">
              Trip Budget Overview
            </CardTitle>
            <p className="text-xs text-surface-500">
              Deterministic cost tracking & financial health
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAssistant && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAssistant}
              className="gap-1.5 text-xs font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Smart Assistant
            </Button>
          )}

          {!isEditing && onUpdateBudget && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditValue(budget.targetBudget.toString());
                setIsEditing(true);
              }}
              className="gap-1 text-xs text-surface-500 hover:text-surface-900 dark:hover:text-surface-100"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Target
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Budget Spend Numbers */}
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 border-b border-surface-200 dark:border-surface-800 pb-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-surface-900 dark:text-surface-50">
                {formatCurrency(budget.total)}
              </span>
              <span className="text-lg font-medium text-surface-400">
                /{" "}
                {isEditing ? (
                  <span className="inline-flex items-center gap-1">
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-8 w-28 text-sm font-semibold inline-block"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-500/10"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(false)}
                      className="h-8 w-8 p-0 text-surface-400 hover:bg-surface-200"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </span>
                ) : (
                  <span className="font-semibold text-surface-600 dark:text-surface-300">
                    {formatCurrency(budget.targetBudget)}
                  </span>
                )}
              </span>
            </div>
            <p className="text-xs font-medium text-surface-500 mt-0.5">
              Total Estimated Trip Cost / Target Budget
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getBadgeStyle()}`}
            >
              {budget.percentageUsed}% Used
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
                budget.isOverBudget
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              }`}
            >
              {budget.isOverBudget
                ? `+${formatCurrency(budget.overBudgetAmount)} Over Budget`
                : `${formatCurrency(budget.remaining)} Remaining`}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-surface-500">
            <span>0%</span>
            <span className="font-semibold text-surface-700 dark:text-surface-300">
              {budget.percentageUsed}% of Target
            </span>
            <span>100%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-surface-200 dark:bg-surface-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{
                width: `${Math.min(budget.percentageUsed, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* 3-Column Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="rounded-xl border border-surface-200/80 dark:border-surface-800 bg-surface-100/50 dark:bg-surface-800/40 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-surface-500">
              <Calendar className="h-3.5 w-3.5 text-primary-500" />
              <span>Cost Per Day</span>
            </div>
            <div className="text-xl font-bold text-surface-900 dark:text-surface-100">
              {formatCurrency(budget.costPerDay)}
              <span className="text-xs font-normal text-surface-400">/day</span>
            </div>
            <p className="text-[11px] text-surface-500">
              Target: {formatCurrency(budget.dailyBudget)}/day
            </p>
          </div>

          <div className="rounded-xl border border-surface-200/80 dark:border-surface-800 bg-surface-100/50 dark:bg-surface-800/40 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-surface-500">
              <TrendingUp className="h-3.5 w-3.5 text-rose-500" />
              <span>Peak Day</span>
            </div>
            <div className="text-xl font-bold text-surface-900 dark:text-surface-100 truncate">
              {budget.mostExpensiveDay
                ? `Day ${budget.mostExpensiveDay.dayNumber}`
                : "None"}
            </div>
            <p className="text-[11px] text-surface-500 truncate">
              {budget.mostExpensiveDay
                ? `${formatCurrency(budget.mostExpensiveDay.amount)} ${
                    budget.mostExpensiveDay.cityName
                      ? `• ${budget.mostExpensiveDay.cityName}`
                      : ""
                  }`
                : "No activities yet"}
            </p>
          </div>

          <div className="rounded-xl border border-surface-200/80 dark:border-surface-800 bg-surface-100/50 dark:bg-surface-800/40 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-surface-500">
              <Layers className="h-3.5 w-3.5 text-indigo-500" />
              <span>Top Category</span>
            </div>
            <div className="text-xl font-bold text-surface-900 dark:text-surface-100 truncate">
              {budget.mostExpensiveCategory
                ? budget.mostExpensiveCategory.category
                : "None"}
            </div>
            <p className="text-[11px] text-surface-500 truncate">
              {budget.mostExpensiveCategory
                ? `${formatCurrency(
                    budget.mostExpensiveCategory.amount
                  )} (${budget.mostExpensiveCategory.percentage}%)`
                : "No expenses yet"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
