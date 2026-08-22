import { Wallet, PieChart as PieChartIcon, TrendingUp, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency } from "@/lib/utils";
import type { BudgetSummary } from "@/types";

interface BudgetSummaryCardsProps {
  summary?: BudgetSummary;
}

export function BudgetSummaryCards({ summary }: BudgetSummaryCardsProps) {
  const totalBudget = summary?.totalBudget || 0;
  const totalSpent = summary?.totalSpent || 0;
  const remaining = summary?.totalRemaining || totalBudget - totalSpent;

  const chartData = [
    { name: "Spent", value: totalSpent, color: "#f59e0b" },
    { name: "Remaining", value: remaining > 0 ? remaining : 0, color: "#10b981" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Budget"
          value={formatCurrency(totalBudget)}
          icon={Wallet}
          iconClassName="bg-primary-50 text-primary-600"
        />
        <StatCard
          label="Total Spent"
          value={formatCurrency(totalSpent)}
          icon={PieChartIcon}
          iconClassName="bg-accent-50 text-accent-600"
        />
        <StatCard
          label="Remaining Budget"
          value={formatCurrency(remaining)}
          icon={TrendingUp}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center justify-between">
            <span>Overall Budget Allocation</span>
            <span className="text-xs font-normal text-surface-500">Across all trips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="h-44 w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val) || 0), "Amount"]}
                    contentStyle={{ borderRadius: "8px", borderColor: "#e2e8f0" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full space-y-3 sm:w-1/2">
              <div className="flex items-center justify-between rounded-lg bg-surface-50 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-3 w-3 rounded-full bg-accent-500" />
                  <span className="text-sm font-medium text-surface-700">Spent to date</span>
                </div>
                <span className="text-sm font-bold text-surface-900">{formatCurrency(totalSpent)}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-surface-50 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-surface-700">Available</span>
                </div>
                <span className="text-sm font-bold text-surface-900">{formatCurrency(remaining)}</span>
              </div>

              <div className="flex items-center justify-between px-1 text-xs text-surface-500">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" /> Total Planned: {formatCurrency(totalBudget)}
                </span>
                <span>
                  {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% used
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
