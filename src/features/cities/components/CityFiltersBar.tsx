import React from "react";
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import type { CityFilters } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CityFiltersBarProps {
  filters: CityFilters;
  onFilterChange: (newFilters: CityFilters) => void;
  availableCountries?: string[];
  availableRegions?: string[];
}

export const CityFiltersBar: React.FC<CityFiltersBarProps> = ({
  filters,
  onFilterChange,
  availableCountries = ["India", "United Arab Emirates", "France", "Indonesia"],
  availableRegions = [],
}) => {
  const hasActiveFilters =
    Boolean(filters.searchQuery?.trim()) ||
    Boolean(filters.country) ||
    Boolean(filters.region) ||
    filters.maxCostIndex !== undefined ||
    filters.minPopularity !== undefined ||
    (filters.sortBy && filters.sortBy !== "popularity-desc");

  const handleReset = () => {
    onFilterChange({
      searchQuery: "",
      country: undefined,
      region: undefined,
      maxCostIndex: undefined,
      minPopularity: undefined,
      sortBy: "popularity-desc",
    });
  };

  return (
    <div className="space-y-3 bg-surface-50/70 dark:bg-surface-900/40 p-4 rounded-xl border border-surface-200 dark:border-surface-800">
      {/* Search and Sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input
            placeholder="Search cities, countries, or regions..."
            value={filters.searchQuery || ""}
            onChange={(e) =>
              onFilterChange({ ...filters, searchQuery: e.target.value })
            }
            className="pl-9 bg-background"
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

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-surface-400 shrink-0" />
          <select
            value={filters.sortBy || "popularity-desc"}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                sortBy: e.target.value as CityFilters["sortBy"],
              })
            }
            className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="popularity-desc">Most Popular</option>
            <option value="name-asc">Alphabetical (A-Z)</option>
            <option value="cost-asc">Cost: Low to High</option>
            <option value="cost-desc">Cost: High to Low</option>
          </select>
        </div>
      </div>

      {/* Filter Pills row */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-surface-500 mr-1">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Country Filter */}
        <select
          value={filters.country || ""}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              country: e.target.value ? e.target.value : undefined,
              region: undefined, // Reset region when country changes
            })
          }
          className="h-8 px-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-background text-xs font-medium text-surface-700 dark:text-surface-300"
        >
          <option value="">All Countries</option>
          {availableCountries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Region Filter if available */}
        {availableRegions.length > 0 && (
          <select
            value={filters.region || ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                region: e.target.value ? e.target.value : undefined,
              })
            }
            className="h-8 px-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-background text-xs font-medium text-surface-700 dark:text-surface-300"
          >
            <option value="">All Regions</option>
            {availableRegions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )}

        {/* Cost Index Filter */}
        <select
          value={filters.maxCostIndex !== undefined ? String(filters.maxCostIndex) : ""}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              maxCostIndex: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="h-8 px-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-background text-xs font-medium text-surface-700 dark:text-surface-300"
        >
          <option value="">Any Cost Index</option>
          <option value="2.5">Budget ($ - max 2.5)</option>
          <option value="3.5">Moderate ($$ - max 3.5)</option>
          <option value="4.5">Premium ($$$ - max 4.5)</option>
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
