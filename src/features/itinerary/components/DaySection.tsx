import React, { useState } from "react";
import type { DayPlan, ItineraryValidationIssue } from "../types";
import { ActivityItem } from "@/features/activities/components/ActivityItem";
import {
  Calendar,
  MapPin,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface DaySectionProps {
  day: DayPlan;
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
  onReorderActivitiesInDay?: (reorderedIds: string[]) => void;
  isInitiallyExpanded?: boolean;
}

export const DaySection: React.FC<DaySectionProps> = ({
  day,
  onAddActivityToDay,
  onToggleComplete,
  onDeleteActivity,
  onUpdateActivity,
  onReorderActivitiesInDay,
  isInitiallyExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

  const activities = day.activities || [];
  const hasConflicts = day.validationIssues && day.validationIssues.length > 0;

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const ids = activities.map((a) => a.id);
    const temp = ids[index];
    ids[index] = ids[index - 1];
    ids[index - 1] = temp;
    onReorderActivitiesInDay?.(ids);
  };

  const handleMoveDown = (index: number) => {
    if (index >= activities.length - 1) return;
    const ids = activities.map((a) => a.id);
    const temp = ids[index];
    ids[index] = ids[index + 1];
    ids[index + 1] = temp;
    onReorderActivitiesInDay?.(ids);
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        hasConflicts
          ? "border-amber-300 dark:border-amber-800 bg-amber-50/10"
          : "border-surface-200 dark:border-surface-800 bg-card"
      }`}
    >
      {/* Header bar */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-surface-50/70 dark:bg-surface-900/40 border-b border-surface-200/60 dark:border-surface-800 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Left info: Day Number, Date, City */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white font-bold text-sm shadow-sm">
            D{day.dayNumber}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-surface-900 dark:text-surface-100">
                Day {day.dayNumber}
              </h3>
              <span className="text-xs text-surface-400">•</span>
              <span className="text-xs font-medium text-surface-600 dark:text-surface-300 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary-500" />
                {day.formattedDate}
              </span>
            </div>

            {/* City location badge */}
            <div className="flex items-center gap-1 text-xs text-surface-500">
              <MapPin className="h-3.5 w-3.5 text-primary-400" />
              <span>
                {day.city ? `${day.city.name}, ${day.city.country}` : "Unassigned Destination"}
              </span>
              {hasConflicts && (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5 ml-2 font-medium">
                  <AlertTriangle className="h-3 w-3" />
                  Notice
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right metrics & action */}
        <div
          className="flex items-center justify-between sm:justify-end gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-right">
            <span className="text-xs font-semibold text-surface-900 dark:text-surface-100 block">
              {activities.length} {activities.length === 1 ? "Activity" : "Activities"}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {day.totalDayCost === 0 ? "Free" : formatCurrency(day.totalDayCost)}
            </span>
          </div>

          {/* Quick Add Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddActivityToDay(day.dayNumber, day.stop?.id)}
            className="h-8 gap-1 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>

          {/* Expand / Collapse toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Activity List */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {/* Day Validation Issues banner */}
          {hasConflicts && (
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              {day.validationIssues.map((issue: ItineraryValidationIssue, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
          )}

          {activities.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-surface-200 dark:border-surface-800 rounded-xl bg-surface-50/40 dark:bg-surface-900/20">
              <p className="text-xs text-surface-500 mb-2">
                No activities scheduled for Day {day.dayNumber} yet.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddActivityToDay(day.dayNumber, day.stop?.id)}
                className="gap-1 text-xs text-primary-600 hover:text-primary-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Schedule First Experience
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activities.map((act, idx) => {
                const actIssue = day.validationIssues.find(
                  (iss) => iss.activityId === act.id
                );
                return (
                  <ActivityItem
                    key={act.id}
                    item={act}
                    isFirst={idx === 0}
                    isLast={idx === activities.length - 1}
                    hasConflict={Boolean(actIssue)}
                    conflictMessage={actIssue?.message}
                    cityName={day.city?.name}
                    onToggleComplete={onToggleComplete}
                    onDelete={onDeleteActivity}
                    onUpdate={onUpdateActivity}
                    onMoveUp={() => handleMoveUp(idx)}
                    onMoveDown={() => handleMoveDown(idx)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
