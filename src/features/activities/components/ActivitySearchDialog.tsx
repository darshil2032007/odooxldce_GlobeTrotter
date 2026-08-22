import React, { useState, useMemo } from "react";
import type { Activity, ActivityFilters, StopWithDetails } from "@/types/database";
import { useActivities, useCategories } from "../hooks/useActivities";
import { ActivityCard } from "./ActivityCard";
import { ActivityFiltersBar } from "./ActivityFiltersBar";
import { ActivityScheduleModal } from "./ActivityScheduleModal";
import { CustomActivityModal } from "./CustomActivityModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Compass, Plus, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";

interface ActivitySearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stops: StopWithDetails[];
  defaultStopId?: string;
  defaultDayNumber?: number;
  totalTripDays?: number;
  onScheduleActivity: (scheduleData: {
    stopId: string;
    activityId?: string | null;
    dayNumber: number;
    scheduledTime?: string;
    cost: number;
    notes?: string;
  }) => Promise<void> | void;
}

export const ActivitySearchDialog: React.FC<ActivitySearchDialogProps> = ({
  open,
  onOpenChange,
  stops,
  defaultStopId,
  defaultDayNumber = 1,
  totalTripDays = 7,
  onScheduleActivity,
}) => {
  // Selected target stop
  const [targetStopId, setTargetStopId] = useState<string>(
    defaultStopId || stops[0]?.id || ""
  );

  React.useEffect(() => {
    if (defaultStopId) {
      setTargetStopId(defaultStopId);
    } else if (stops.length > 0 && !targetStopId) {
      setTargetStopId(stops[0].id);
    }
  }, [defaultStopId, stops, targetStopId]);

  const activeStop = useMemo(
    () => stops.find((s) => s.id === targetStopId) || stops[0],
    [stops, targetStopId]
  );

  const [filters, setFilters] = useState<ActivityFilters>({
    searchQuery: "",
    sortBy: "cost-asc",
  });

  const {
    data: activities = [],
    isLoading,
    isError,
  } = useActivities(activeStop?.city_id, filters);

  const { data: categories = [] } = useCategories();

  // Activity to schedule modal state
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);

  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setScheduleModalOpen(true);
  };

  const handleScheduleConfirm = async (data: {
    stopId: string;
    activityId: string;
    dayNumber: number;
    scheduledTime?: string;
    cost: number;
    notes?: string;
  }) => {
    await onScheduleActivity(data);
    setScheduleModalOpen(false);
    onOpenChange(false);
  };

  const handleCustomActivityConfirm = async (data: {
    stopId: string;
    title: string;
    category: string;
    cost: number;
    dayNumber: number;
    scheduledTime?: string;
    notes?: string;
  }) => {
    await onScheduleActivity({
      stopId: data.stopId,
      activityId: null, // custom activity without catalog ID
      dayNumber: data.dayNumber,
      scheduledTime: data.scheduledTime,
      cost: data.cost,
      notes: data.notes ? `[${data.category}] ${data.title}: ${data.notes}` : `[${data.category}] ${data.title}`,
    });
    setCustomModalOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">Discover & Add Activities</DialogTitle>
                  <DialogDescription className="text-xs text-surface-500">
                    Find top-rated sightseeing, tours, culinary trails, and adventures.
                  </DialogDescription>
                </div>
              </div>

              {/* Add Custom Activity Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCustomModalOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Custom Activity
              </Button>
            </div>

            {/* Target Stop selector tabs / pill bar */}
            {stops.length > 1 && (
              <div className="flex items-center gap-2 pt-3 overflow-x-auto pb-1">
                <span className="text-xs font-medium text-surface-500 shrink-0">City Stop:</span>
                {stops.map((stop) => (
                  <button
                    key={stop.id}
                    onClick={() => setTargetStopId(stop.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                      activeStop?.id === stop.id
                        ? "bg-primary-500 text-white shadow-sm"
                        : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200"
                    }`}
                  >
                    {stop.city?.name || `Stop ${stop.stop_order + 1}`}
                  </button>
                ))}
              </div>
            )}
          </DialogHeader>

          {/* Active city banner */}
          {activeStop?.city && (
            <div className="flex items-center justify-between px-3 py-2 bg-surface-100/70 dark:bg-surface-800/40 rounded-lg text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-background">
                  {activeStop.city.name}
                </Badge>
                <span className="text-surface-500 truncate max-w-md">
                  Showing curated activities in {activeStop.city.name}, {activeStop.city.country}
                </span>
              </div>
              <span className="text-surface-400 text-[11px] hidden sm:inline">
                {activities.length} experiences available
              </span>
            </div>
          )}

          {/* Filter Bar */}
          <ActivityFiltersBar
            filters={filters}
            onFilterChange={setFilters}
            categories={categories}
          />

          {/* Activity Cards List */}
          <div className="flex-1 overflow-y-auto pr-1 py-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-surface-200 p-4 space-y-3">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <EmptyState
                icon={Compass}
                title="Could not load activities"
                description="Please check your connection and try again."
              />
            ) : activities.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <EmptyState
                  icon={Sparkles}
                  title="No activities match your filters"
                  description="Try selecting a different category or resetting filters."
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomModalOpen(true)}
                  className="gap-1.5 text-xs mt-2"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Custom Activity
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {activities.map((act) => (
                  <ActivityCard
                    key={act.id}
                    activity={act}
                    onSelect={handleSelectActivity}
                    actionLabel="Schedule"
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      {selectedActivity && (
        <ActivityScheduleModal
          open={scheduleModalOpen}
          onOpenChange={setScheduleModalOpen}
          activity={selectedActivity}
          stops={stops}
          defaultStopId={activeStop?.id}
          defaultDayNumber={defaultDayNumber}
          totalTripDays={totalTripDays}
          onSchedule={handleScheduleConfirm}
        />
      )}

      {/* Custom Activity Modal */}
      <CustomActivityModal
        open={customModalOpen}
        onOpenChange={setCustomModalOpen}
        stops={stops}
        defaultStopId={activeStop?.id}
        defaultDayNumber={defaultDayNumber}
        totalTripDays={totalTripDays}
        onSave={handleCustomActivityConfirm}
      />
    </>
  );
};
