import React from "react";
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import type { ActivityFilters } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ActivityFiltersBarProps {
  filters: ActivityFilters;
  onFilterChange: (newFilters: ActivityFilters) => void;
  categories?: string[];
}

export const ActivityFiltersBar: React.FC<ActivityFiltersBarProps> = ({
  filters,
  onFilterChange,
  categories = [
    "Culture & History",
    "Sightseeing",
    "Food & Dining",
    "Adventure",
    "Nature",
    "Entertainment",
    "Wellness",
  ],
}) => {
  const hasActiveFilters =
    Boolean(filters.searchQuery?.trim()) ||
    Boolean(filters.category) ||
    filters.maxCost !== undefined ||
    (filters.sortBy && filters.sortBy !== "cost-asc");

  const handleReset = () => {
    onFilterChange({
      searchQuery: "",
      category: undefined,
      maxCost: undefined,
      sortBy: "cost-asc",
    });
  };

  return (
    <div className="space-y-3 bg-surface-50/70 dark:bg-surface-900/40 p-4 rounded-xl border border-surface-200 dark:border-surface-800">
      {/* Search and Sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input
            placeholder="Search activities, tours, landmarks, experiences..."
            value={filters.searchQuery || ""}
            onChange={(e) =>
              onFilterChange({ ...filters, searchQuery: e.target.value })
            }
            className="pl-9 bg-background text-xs"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-surface-400 shrink-0" />
          <select
            value={filters.sortBy || "cost-asc"}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                sortBy: e.target.value as ActivityFilters["sortBy"],
              })
            }
            className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="cost-asc">Cost: Low to High</option>
            <option value="cost-desc">Cost: High to Low</option>
            <option value="duration-asc">Duration: Shortest First</option>
            <option value="title-asc">Title: A-Z</option>
          </select>
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-surface-500 mr-1">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Category Filter */}
        <select
          value={filters.category || ""}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              category: e.target.value ? e.target.value : undefined,
            })
          }
          className="h-8 px-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-background text-xs font-medium text-surface-700 dark:text-surface-300"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Max Cost Filter */}
        <select
          value={filters.maxCost !== undefined ? String(filters.maxCost) : ""}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              maxCost: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="h-8 px-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-background text-xs font-medium text-surface-700 dark:text-surface-300"
        >
          <option value="">Any Cost</option>
          <option value="0">Free Only ($0)</option>
          <option value="15">Under $15</option>
          <option value="30">Under $30</option>
          <option value="50">Under $50</option>
          <option value="100">Under $100</option>
        </select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2.5 text-xs text-surface-500 hover:text-surface-900 ml-auto"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};
