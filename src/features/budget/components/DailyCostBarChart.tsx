import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { DailyCostItem } from "../types";

interface DailyCostBarChartProps {
  days: DailyCostItem[];
  dailyBudget: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: DailyCostItem;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-900/90 p-3 shadow-xl backdrop-blur-md text-white text-xs space-y-1">
        <div className="font-bold text-sm text-primary-400">
          Day {data.dayNumber}{" "}
          {data.cityName && (
            <span className="text-surface-300 font-normal">
              • {data.cityName}
            </span>
          )}
        </div>
        {data.formattedDate && (
          <p className="text-[11px] text-surface-400">{data.formattedDate}</p>
        )}
        <div className="flex justify-between gap-4 text-surface-300 pt-1">
          <span>Day Total:</span>
          <span className="font-semibold text-white">
            {formatCurrency(data.amount)}
          </span>
        </div>
        <div className="flex justify-between gap-4 text-surface-300">
          <span>Activities:</span>
          <span className="font-semibold text-white">
            {data.activitiesCount} planned
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function DailyCostBarChart({
  days,
  dailyBudget,
}: DailyCostBarChartProps) {
  if (days.length === 0) {
    return (
      <Card className="shadow-card border-surface-200 dark:border-surface-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">Daily Cost Timeline</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex flex-col items-center justify-center text-center text-surface-400 text-sm">
          <p>No daily itinerary days scheduled.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border-surface-200 dark:border-surface-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold">
            Daily Spending Timeline
          </CardTitle>
          <p className="text-xs text-surface-500">
            Day-by-day expenditure vs target pace ({formatCurrency(dailyBudget)}/day)
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={days}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
                className="dark:stroke-surface-800"
              />
              <XAxis
                dataKey="dayNumber"
                tickFormatter={(val) => `D${val}`}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="#94a3b8"
              />
              <YAxis
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="#94a3b8"
              />
              <Tooltip content={<CustomTooltip />} />
              {dailyBudget > 0 && (
                <ReferenceLine
                  y={dailyBudget}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{
                    value: "Daily Pace",
                    position: "insideTopRight",
                    fill: "#f59e0b",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
              )}
              <Bar
                dataKey="amount"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              >
                {days.map((entry, index) => {
                  const isOverDaily = dailyBudget > 0 && entry.amount > dailyBudget;
                  return (
                    <Cell
                      key={`bar-${index}`}
                      fill={isOverDaily ? "#f97316" : "#0ea5e9"}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
