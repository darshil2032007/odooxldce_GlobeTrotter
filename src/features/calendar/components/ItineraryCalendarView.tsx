import React, { useState } from "react";
import type { DayPlan } from "@/features/itinerary/types";
import { CalendarDayStrip } from "./CalendarDayStrip";
import { TimelineTimeGrid } from "./TimelineTimeGrid";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { Calendar as CalendarIcon } from "lucide-react";

interface ItineraryCalendarViewProps {
  days: DayPlan[];
  onAddActivityToDay: (dayNumber: number, stopId?: string) => void;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onDeleteActivity: (id: string) => void;
  onUpdateActivity: (
    id: string,
    updates: {
      scheduled_time?: string | null;
      cost?: number;
      notes?: string | null;
      day_number?: number;
    }
  ) => void;
}

export const ItineraryCalendarView: React.FC<ItineraryCalendarViewProps> = ({
  days,
  onAddActivityToDay,
  onToggleComplete,
  onDeleteActivity,
  onUpdateActivity,
}) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  if (days.length === 0) {
    return (
      <EmptyState
        icon={CalendarIcon}
        title="No itinerary schedule available"
        description="Add stops or dates to view the interactive calendar & timeline."
      />
    );
  }

  const currentDay =
    days.find((d) => d.dayNumber === selectedDayNumber) || days[0];

  return (
    <div className="space-y-6">
      {/* 1. Horizontal Date Ribbon Strip */}
      <div className="space-y-2 bg-surface-50/70 dark:bg-surface-900/40 p-3.5 rounded-2xl border border-surface-200 dark:border-surface-800">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
            Select Itinerary Day
          </span>
          <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
            Day {currentDay.dayNumber} of {days.length}
          </span>
        </div>
        <CalendarDayStrip
          days={days}
          selectedDayNumber={selectedDayNumber}
          onSelectDay={setSelectedDayNumber}
        />
      </div>

      {/* 2. Selected Day Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-surface-200 dark:border-surface-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500 text-white font-bold text-xs">
              D{currentDay.dayNumber}
            </span>
            <h3 className="font-bold text-lg text-surface-900 dark:text-surface-100">
              {currentDay.formattedDate}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs text-surface-500">
            <MapPin className="h-3.5 w-3.5 text-primary-500" />
            <span>
              {currentDay.city
                ? `${currentDay.city.name}, ${currentDay.city.country}`
                : "Destination unassigned"}
            </span>
            <span>•</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Day Est. Cost:{" "}
              {currentDay.totalDayCost === 0
                ? "Free"
                : formatCurrency(currentDay.totalDayCost)}
            </span>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() =>
            onAddActivityToDay(currentDay.dayNumber, currentDay.stop?.id)
          }
          className="gap-1.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Activity to Day {currentDay.dayNumber}
        </Button>
      </div>

      {/* 3. Timeline progression */}
      <div className="p-6 rounded-2xl bg-card border border-surface-200 dark:border-surface-800 shadow-sm">
        <TimelineTimeGrid
          day={currentDay}
          totalDays={days.length}
          onToggleComplete={onToggleComplete}
          onDeleteActivity={onDeleteActivity}
          onUpdateActivity={onUpdateActivity}
          onAddActivity={onAddActivityToDay}
        />
      </div>
    </div>
  );
};
