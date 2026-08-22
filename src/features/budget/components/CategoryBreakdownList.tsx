import {
  Compass,
  Plane,
  Building,
  Utensils,
  ShoppingBag,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CategoryCostItem } from "../types";

interface CategoryBreakdownListProps {
  categories: CategoryCostItem[];
  totalCost: number;
}

const getCategoryIcon = (category: string) => {
  const lower = category.toLowerCase();
  if (lower.includes("activ") || lower.includes("sight") || lower.includes("advent")) {
    return Compass;
  }
  if (lower.includes("transp") || lower.includes("flight") || lower.includes("cab")) {
    return Plane;
  }
  if (lower.includes("hotel") || lower.includes("accom") || lower.includes("stay")) {
    return Building;
  }
  if (lower.includes("food") || lower.includes("din") || lower.includes("meal")) {
    return Utensils;
  }
  if (lower.includes("shop")) {
    return ShoppingBag;
  }
  return MoreHorizontal;
};

export function CategoryBreakdownList({
  categories,
  totalCost,
}: CategoryBreakdownListProps) {
  if (categories.length === 0) return null;

  return (
    <Card className="shadow-card border-surface-200 dark:border-surface-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">Category Itemization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((item) => {
          const Icon = getCategoryIcon(item.category);
          return (
            <div key={item.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-surface-800 dark:text-surface-200">
                    {item.category}
                  </span>
                  <span className="text-[11px] font-normal text-surface-400">
                    ({item.count} {item.count === 1 ? "item" : "items"})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-surface-900 dark:text-surface-100 font-bold">
                    {formatCurrency(item.amount)}
                  </span>
                  <span className="text-surface-400 font-normal w-12 text-right">
                    {item.percentageOfTotal}%
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(item.percentageOfTotal, 2)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
