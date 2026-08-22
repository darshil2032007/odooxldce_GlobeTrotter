import React from "react";
import type { TripWithDetails } from "@/types/database";
import { Calendar, MapPin, DollarSign, Plus, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateRange, formatCurrency, getTripDuration } from "@/lib/utils";

interface TripHeaderSummaryProps {
  trip: TripWithDetails;
  totalActivities: number;
  completedActivities: number;
  totalCost: number;
  onAddStop?: () => void;
  onAddActivity?: () => void;
}

export const TripHeaderSummary: React.FC<TripHeaderSummaryProps> = ({
  trip,
  totalActivities,
  completedActivities,
  totalCost,
  onAddStop,
  onAddActivity,
}) => {
  const durationDays = getTripDuration(trip.start_date, trip.end_date);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-800 bg-card p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left info column */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="text-xs font-semibold px-2.5 py-0.5">
              Itinerary Workspace
            </Badge>
            <Badge variant="outline" className="text-xs text-surface-500">
              {durationDays} Days Duration
            </Badge>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
            {trip.title}
          </h2>

          {trip.description && (
            <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 line-clamp-2">
              {trip.description}
            </p>
          )}

          {/* Destination Stops Pills */}
          {trip.stops && trip.stops.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-medium text-surface-500">Stops:</span>
              {trip.stops.map((s, idx) => (
                <div
                  key={s.id}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-xs font-medium text-surface-800 dark:text-surface-200 border border-surface-200 dark:border-surface-700"
                >
                  <MapPin className="h-3 w-3 text-primary-500" />
                  <span>
                    #{idx + 1} {s.city?.name || "City"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right metrics grid & action buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full sm:w-auto">
            {/* Dates */}
            <div className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200/60 dark:border-surface-800 text-left">
              <div className="flex items-center gap-1 text-[11px] text-surface-500 font-medium">
                <Calendar className="h-3.5 w-3.5 text-primary-500" />
                <span>Dates</span>
              </div>
              <p className="font-semibold text-xs text-surface-900 dark:text-surface-100 mt-1 truncate">
                {formatDateRange(trip.start_date, trip.end_date)}
              </p>
            </div>

            {/* Total Activities */}
            <div className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200/60 dark:border-surface-800 text-left">
              <div className="flex items-center gap-1 text-[11px] text-surface-500 font-medium">
                <Compass className="h-3.5 w-3.5 text-primary-500" />
                <span>Activities</span>
              </div>
              <p className="font-semibold text-xs text-surface-900 dark:text-surface-100 mt-1">
                {totalActivities} planned ({completedActivities} done)
              </p>
            </div>

            {/* Target Budget & Est. Activity Cost */}
            <div className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200/60 dark:border-surface-800 text-left col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1 text-[11px] text-surface-500 font-medium">
                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                <span>Est. Activities</span>
              </div>
              <p className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(totalCost)}
                <span className="text-[10px] text-surface-400 font-normal ml-1">
                  (of {formatCurrency(trip.target_budget)})
                </span>
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onAddStop && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddStop}
                className="gap-1.5 text-xs font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Stop
              </Button>
            )}
            {onAddActivity && (
              <Button
                size="sm"
                onClick={onAddActivity}
                className="gap-1.5 text-xs font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Activity
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
