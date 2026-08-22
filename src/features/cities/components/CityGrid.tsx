import React from "react";
import type { City } from "@/types/database";
import { CityCard } from "./CityCard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { MapPin } from "lucide-react";

interface CityGridProps {
  cities: City[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onSelectCity?: (city: City) => void;
  selectedCityIds?: string[];
  actionLabel?: string;
}

export const CityGrid: React.FC<CityGridProps> = ({
  cities,
  isLoading = false,
  isError = false,
  onRetry,
  onSelectCity,
  selectedCityIds = [],
  actionLabel = "Add to Trip",
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-surface-200 p-4 space-y-3">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load destinations"
        message="Could not connect to the cities catalog. Please try again."
        onRetry={onRetry}
      />
    );
  }

  if (!cities || cities.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No destinations found"
        description="Try adjusting your search query, country filter, or cost index."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cities.map((city) => (
        <CityCard
          key={city.id}
          city={city}
          onSelect={onSelectCity}
          isSelected={selectedCityIds.includes(city.id)}
          actionLabel={actionLabel}
        />
      ))}
    </div>
  );
};
