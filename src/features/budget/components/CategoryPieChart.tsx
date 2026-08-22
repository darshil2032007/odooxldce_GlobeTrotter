import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CategoryCostItem } from "../types";

interface CategoryPieChartProps {
  categories: CategoryCostItem[];
  totalCost: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: CategoryCostItem;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-900/90 p-3 shadow-xl backdrop-blur-md text-white text-xs space-y-1">
        <div className="flex items-center gap-2 font-bold text-sm">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.category}</span>
        </div>
        <div className="flex justify-between gap-4 text-surface-300">
          <span>Amount:</span>
          <span className="font-semibold text-white">
            {formatCurrency(item.amount)}
          </span>
        </div>
        <div className="flex justify-between gap-4 text-surface-300">
          <span>Share:</span>
          <span className="font-semibold text-white">
            {item.percentageOfTotal}%
          </span>
        </div>
        <div className="flex justify-between gap-4 text-surface-300">
          <span>Items:</span>
          <span className="font-semibold text-white">
            {item.count} {item.count === 1 ? "entry" : "entries"}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function CategoryPieChart({
  categories,
  totalCost,
}: CategoryPieChartProps) {
  const chartData = categories.filter((c) => c.amount > 0);

  if (chartData.length === 0) {
    return (
      <Card className="shadow-card border-surface-200 dark:border-surface-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex flex-col items-center justify-center text-center text-surface-400 text-sm">
          <p>No expenses recorded yet.</p>
          <p className="text-xs text-surface-500 mt-1">
            Add activities or expenses to visualize category breakdown.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border-surface-200 dark:border-surface-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold">
            Spending by Category
          </CardTitle>
          <p className="text-xs text-surface-500">
            Distribution across activities, transport, stay & more
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value: string, entry) => {
                  const item = chartData.find((c) => c.category === value);
                  return (
                    <span className="text-xs font-medium text-surface-700 dark:text-surface-300">
                      {value}{" "}
                      <span className="text-surface-400">
                        ({item?.percentageOfTotal || 0}%)
                      </span>
                    </span>
                  );
                }}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Total Cost Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-surface-400">
              Total
            </span>
            <span className="text-sm font-extrabold text-surface-800 dark:text-surface-200">
              {formatCurrency(totalCost)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
