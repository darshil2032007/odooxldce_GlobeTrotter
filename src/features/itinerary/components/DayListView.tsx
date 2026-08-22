import React, { useState } from "react";
import type { DayPlan } from "../types";
import { DaySection } from "./DaySection";
import { Button } from "@/components/ui/button";
import { ChevronsDown, ChevronsUp, Calendar } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface DayListViewProps {
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
  onReorderActivitiesInDay?: (dayNumber: number, reorderedIds: string[]) => void;
}

export const DayListView: React.FC<DayListViewProps> = ({
  days,
  onAddActivityToDay,
  onToggleComplete,
  onDeleteActivity,
  onUpdateActivity,
  onReorderActivitiesInDay,
}) => {
  const [expandAllKey, setExpandAllKey] = useState<number>(1);
  const [allExpanded, setAllExpanded] = useState<boolean>(true);

  const toggleAll = () => {
    setAllExpanded(!allExpanded);
    setExpandAllKey((prev) => prev + 1);
  };

  if (days.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No itinerary days created"
        description="Set trip dates or add a destination stop to derive your day-wise schedule."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-surface-500 font-medium">
          Showing {days.length}-day schedule breakdown
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAll}
          className="h-7 text-xs text-surface-500 hover:text-surface-900 gap-1"
        >
          {allExpanded ? (
            <>
              <ChevronsUp className="h-3.5 w-3.5" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronsDown className="h-3.5 w-3.5" />
              Expand All
            </>
          )}
        </Button>
      </div>

      {/* Days stack */}
      <div key={expandAllKey} className="space-y-4">
        {days.map((day) => (
          <DaySection
            key={`day-${day.dayNumber}`}
            day={day}
            isInitiallyExpanded={allExpanded}
            onAddActivityToDay={onAddActivityToDay}
            onToggleComplete={onToggleComplete}
            onDeleteActivity={onDeleteActivity}
            onUpdateActivity={onUpdateActivity}
            onReorderActivitiesInDay={(ids) =>
              onReorderActivitiesInDay?.(day.dayNumber, ids)
            }
          />
        ))}
      </div>
    </div>
  );
};
