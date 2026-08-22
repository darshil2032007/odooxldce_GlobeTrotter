import React, { useState } from "react";
import type { StopWithDetails, City } from "@/types/database";
import { StopCard } from "./StopCard";
import { CitySearchDialog } from "@/features/cities/components/CitySearchDialog";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface StopsManagerProps {
  tripId: string;
  stops: StopWithDetails[];
  tripStartDate?: string;
  tripEndDate?: string;
  onAddStop: (city: City, arrivalDate?: string, departureDate?: string) => Promise<void> | void;
  onDeleteStop: (stopId: string) => Promise<void> | void;
  onReorderStops: (newOrder: { id: string; stop_order: number }[]) => Promise<void> | void;
  onUpdateStopDates: (stopId: string, arrivalDate?: string | null, departureDate?: string | null) => Promise<void> | void;
  onAddActivityToStop?: (stopId: string) => void;
}

export const StopsManager: React.FC<StopsManagerProps> = ({
  stops,
  tripStartDate,
  tripEndDate,
  onAddStop,
  onDeleteStop,
  onReorderStops,
  onUpdateStopDates,
  onAddActivityToStop,
}) => {
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newStops = [...stops];
    const temp = newStops[index];
    newStops[index] = newStops[index - 1];
    newStops[index - 1] = temp;

    const orderedUpdates = newStops.map((s, idx) => ({
      id: s.id,
      stop_order: idx,
    }));
    onReorderStops(orderedUpdates);
  };

  const handleMoveDown = (index: number) => {
    if (index >= stops.length - 1) return;
    const newStops = [...stops];
    const temp = newStops[index];
    newStops[index] = newStops[index + 1];
    newStops[index + 1] = temp;

    const orderedUpdates = newStops.map((s, idx) => ({
      id: s.id,
      stop_order: idx,
    }));
    onReorderStops(orderedUpdates);
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-50 dark:bg-surface-900/40 p-4 rounded-xl border border-surface-200 dark:border-surface-800">
        <div>
          <h3 className="font-bold text-base text-surface-900 dark:text-surface-100 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary-500" />
            Trip Destinations & Stops
          </h3>
          <p className="text-xs text-surface-500 mt-0.5">
            Organize multi-city stops in sequential order. Use Move Up / Move Down to reorder.
          </p>
        </div>

        <Button
          onClick={() => setSearchDialogOpen(true)}
          size="sm"
          className="gap-1.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Destination Stop
        </Button>
      </div>

      {/* Stops list or empty state */}
      {stops.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-2xl bg-surface-50/50 dark:bg-surface-900/20 p-8">
          <EmptyState
            icon={Sparkles}
            title="No destination stops added yet"
            description="Start building your multi-city itinerary by adding your first city stop."
          />
          <Button
            onClick={() => setSearchDialogOpen(true)}
            size="sm"
            className="mt-4 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add First Destination
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {stops.map((stop, idx) => (
            <StopCard
              key={stop.id}
              stop={stop}
              stopIndex={idx}
              totalStops={stops.length}
              tripStartDate={tripStartDate}
              tripEndDate={tripEndDate}
              onMoveUp={() => handleMoveUp(idx)}
              onMoveDown={() => handleMoveDown(idx)}
              onDelete={onDeleteStop}
              onUpdateDates={onUpdateStopDates}
              onAddActivity={onAddActivityToStop}
            />
          ))}
        </div>
      )}

      {/* Add City Modal */}
      <CitySearchDialog
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
        onAddStop={onAddStop}
        tripStartDate={tripStartDate}
        tripEndDate={tripEndDate}
        existingCityIds={stops.map((s) => s.city_id)}
      />
    </div>
  );
};
