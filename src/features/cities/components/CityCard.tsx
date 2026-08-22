import React from "react";
import { MapPin, Star, Plus, Check, DollarSign } from "lucide-react";
import type { City } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CityCardProps {
  city: City;
  onSelect?: (city: City) => void;
  isSelected?: boolean;
  actionLabel?: string;
  disabled?: boolean;
}

export const CityCard: React.FC<CityCardProps> = ({
  city,
  onSelect,
  isSelected = false,
  actionLabel = "Add to Trip",
  disabled = false,
}) => {
  // Helper to render cost index dollar signs
  const renderCostIndex = (index: number) => {
    const rounded = Math.min(Math.max(Math.round(index), 1), 5);
    return (
      <div className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
        <span className="flex">
          {Array.from({ length: rounded }).map((_, i) => (
            <DollarSign key={i} className="h-3 w-3 -mr-1" />
          ))}
        </span>
        <span className="ml-1.5 text-[11px] text-surface-500 font-normal">
          ({city.cost_index.toFixed(1)}/5)
        </span>
      </div>
    );
  };

  return (
    <Card
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
        isSelected
          ? "ring-2 ring-primary-500 border-primary-500 bg-primary-50/20"
          : "border-surface-200 dark:border-surface-800 bg-card"
      }`}
    >
      {/* City Thumbnail Image */}
      <div className="relative h-44 w-full overflow-hidden bg-surface-100 dark:bg-surface-800">
        <img
          src={
            city.image_url ||
            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
          }
          alt={city.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Popularity Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-amber-300 shadow-sm">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>{city.popularity_score.toFixed(1)}</span>
        </div>

        {/* Region / Country Pill */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          <Badge
            variant="secondary"
            className="bg-white/85 text-surface-900 dark:bg-black/70 dark:text-white backdrop-blur-md border-0 text-[11px] font-medium"
          >
            {city.country}
          </Badge>
          {city.region && (
            <Badge
              variant="outline"
              className="bg-black/50 text-white/90 border-white/20 backdrop-blur-md text-[11px] hidden sm:inline-flex"
            >
              {city.region}
            </Badge>
          )}
        </div>

        {/* City Name Header Overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-lg font-bold tracking-tight drop-shadow-sm line-clamp-1">
            {city.name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-white/80">
            <MapPin className="h-3.5 w-3.5 text-primary-300 shrink-0" />
            <span className="truncate">
              {city.region ? `${city.region}, ${city.country}` : city.country}
            </span>
          </div>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="p-4 space-y-3">
        {/* Cost Index & Rating Bar */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-surface-500">Cost Level:</span>
          {renderCostIndex(city.cost_index)}
        </div>

        {/* Short Description */}
        {city.description && (
          <p className="text-xs text-surface-600 dark:text-surface-400 line-clamp-2 leading-relaxed min-h-[2rem]">
            {city.description}
          </p>
        )}

        {/* Action Button */}
        {onSelect && (
          <Button
            onClick={() => onSelect(city)}
            disabled={disabled}
            size="sm"
            variant={isSelected ? "secondary" : "default"}
            className="w-full gap-1.5 font-medium transition-all"
          >
            {isSelected ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                Added to Trip
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {actionLabel}
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};
