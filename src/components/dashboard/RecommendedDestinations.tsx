import { Star, MapPin, Sparkles, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { RecommendedDestination } from "@/types";

interface RecommendedDestinationsProps {
  destinations?: RecommendedDestination[];
  onSelectDestination?: (destination: RecommendedDestination) => void;
}

export function RecommendedDestinations({
  destinations,
  onSelectDestination,
}: RecommendedDestinationsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-500" />
            <span>Recommended Destinations</span>
          </CardTitle>
          <p className="text-xs text-surface-500 mt-0.5">
            Curated ideas for your next multi-city trip
          </p>
        </div>
        <Badge variant="warning" className="text-[11px]">
          AI Powered
        </Badge>
      </CardHeader>
      <CardContent>
        {!destinations || destinations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-surface-200 rounded-xl bg-surface-50">
            <Sparkles className="h-8 w-8 text-surface-300 mb-2" />
            <p className="text-sm font-medium text-surface-600">No recommendations available</p>
            <p className="text-xs text-surface-400 max-w-xs mt-1">
              Developer 4 recommendations will appear here based on your preferences.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.map((dest) => (
              <div
                key={dest.id}
                className="group relative overflow-hidden rounded-xl border border-surface-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-card"
              >
                <div className="relative h-36 w-full overflow-hidden bg-surface-100">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{dest.rating}</span>
                  </div>
                </div>

                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h4 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors">
                        {dest.name}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-surface-500 mt-0.5">
                        <MapPin className="h-3 w-3 text-surface-400" />
                        <span>{dest.country}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-surface-100 pt-2.5">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-surface-400 block">Avg. Cost</span>
                      <span className="text-xs font-bold text-surface-800">
                        {formatCurrency(dest.averageCost)}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs gap-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                      onClick={() => onSelectDestination?.(dest)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Plan
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
