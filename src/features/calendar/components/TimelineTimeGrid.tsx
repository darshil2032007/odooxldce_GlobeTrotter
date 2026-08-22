import React, { useState } from "react";
import type { StopActivityWithDetails } from "@/types/database";
import type { DayPlan } from "@/features/itinerary/types";
import {
  Sun,
  SunMedium,
  Sunset,
  Moon,
  Clock,
  Check,
  Trash2,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { getCategoryColor } from "@/features/activities/utils/categoryColors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimelineTimeGridProps {
  day: DayPlan;
  totalDays: number;
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
  onAddActivity: (dayNumber: number, stopId?: string) => void;
}

interface TimeBlock {
  key: string;
  title: string;
  timeRange: string;
  icon: React.ElementType;
  startHour: number;
  endHour: number;
}

const TIME_BLOCKS: TimeBlock[] = [
  {
    key: "morning",
    title: "Morning",
    timeRange: "06:00 - 12:00",
    icon: Sun,
    startHour: 6,
    endHour: 12,
  },
  {
    key: "afternoon",
    title: "Afternoon",
    timeRange: "12:00 - 17:00",
    icon: SunMedium,
    startHour: 12,
    endHour: 17,
  },
  {
    key: "evening",
    title: "Evening",
    timeRange: "17:00 - 21:00",
    icon: Sunset,
    startHour: 17,
    endHour: 21,
  },
  {
    key: "night",
    title: "Night",
    timeRange: "21:00 - 04:00",
    icon: Moon,
    startHour: 21,
    endHour: 28, // handles late hours
  },
];

export const TimelineTimeGrid: React.FC<TimelineTimeGridProps> = ({
  day,
  totalDays,
  onToggleComplete,
  onDeleteActivity,
  onUpdateActivity,
  onAddActivity,
}) => {
  // Reschedule dialog state
  const [rescheduleTarget, setRescheduleTarget] = useState<StopActivityWithDetails | null>(null);
  const [newDay, setNewDay] = useState<number>(day.dayNumber);
  const [newTime, setNewTime] = useState<string>("10:00");

  const activities = day.activities || [];

  const handleOpenReschedule = (act: StopActivityWithDetails) => {
    setRescheduleTarget(act);
    setNewDay(act.day_number);
    setNewTime(act.scheduled_time || "10:00");
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget) return;

    onUpdateActivity(rescheduleTarget.id, {
      day_number: Number(newDay),
      scheduled_time: newTime || null,
    });
    setRescheduleTarget(null);
  };

  // Group activities by time blocks
  const getActivitiesForBlock = (block: TimeBlock) => {
    return activities.filter((act) => {
      if (!act.scheduled_time) {
        return block.key === "morning"; // place un-timed in morning
      }
      const hour = parseInt(act.scheduled_time.split(":")[0], 10);
      return hour >= block.startHour && hour < block.endHour;
    });
  };

  return (
    <div className="space-y-6">
      {/* Time blocks vertical progression */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-200 dark:before:bg-surface-800">
        {TIME_BLOCKS.map((block) => {
          const BlockIcon = block.icon;
          const blockActivities = getActivitiesForBlock(block);

          return (
            <div key={block.key} className="relative space-y-3">
              {/* Timeline Period Node Header */}
              <div className="flex items-center gap-2.5">
                <div className="absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary-500 text-primary-500 shadow-xs">
                  <BlockIcon className="h-3 w-3" />
                </div>

                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-surface-900 dark:text-surface-100">
                    {block.title}
                  </h4>
                  <span className="text-[11px] text-surface-400 font-mono">
                    ({block.timeRange})
                  </span>
                </div>
              </div>

              {/* Activities in this block */}
              {blockActivities.length === 0 ? (
                <div className="p-3.5 rounded-xl border border-dashed border-surface-200 dark:border-surface-800 bg-surface-50/40 dark:bg-surface-900/10 flex items-center justify-between text-xs text-surface-400">
                  <span>No experiences scheduled for the {block.title.toLowerCase()}.</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddActivity(day.dayNumber, day.stop?.id)}
                    className="h-7 text-[11px] gap-1 text-primary-600 hover:text-primary-700"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {blockActivities.map((act) => {
                    const actIssue = day.validationIssues.find(
                      (iss) => iss.activityId === act.id
                    );
                    const title =
                      act.activity?.title || act.notes?.split("\n")[0] || "Custom Activity";
                    const category = act.activity?.category || "Custom Plan";
                    const duration = act.activity?.duration_hours;

                    return (
                      <div
                        key={act.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          act.is_completed
                            ? "bg-surface-50 dark:bg-surface-900/30 border-surface-200 opacity-60"
                            : actIssue
                            ? "bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700"
                            : "bg-card border-surface-200 dark:border-surface-800 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Left: Complete toggle & Info */}
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <button
                              onClick={() => onToggleComplete(act.id, !act.is_completed)}
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                act.is_completed
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-surface-300 hover:border-primary-500"
                              }`}
                            >
                              {act.is_completed && <Check className="h-3 w-3" />}
                            </button>

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400">
                                  {act.scheduled_time
                                    ? act.scheduled_time.slice(0, 5)
                                    : "--:--"}
                                </span>
                                <h5
                                  className={`font-semibold text-xs sm:text-sm truncate ${
                                    act.is_completed
                                      ? "line-through text-surface-400"
                                      : "text-surface-900 dark:text-surface-100"
                                  }`}
                                >
                                  {title}
                                </h5>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] py-0 ${getCategoryColor(category)}`}
                                >
                                  {category}
                                </Badge>
                                {duration && (
                                  <span className="text-[11px] text-surface-500 font-medium">
                                    ({duration}h)
                                  </span>
                                )}
                              </div>

                              {act.notes && (
                                <p className="text-xs text-surface-500 line-clamp-1 italic">
                                  {act.notes}
                                </p>
                              )}

                              {actIssue && (
                                <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                                  <AlertTriangle className="h-3 w-3 shrink-0" />
                                  <span>{actIssue.message}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Cost & Quick Reschedule Button */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-xs text-surface-900 dark:text-surface-100">
                              {act.cost === 0 ? "Free" : formatCurrency(act.cost)}
                            </span>

                            {/* Reschedule Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenReschedule(act)}
                              className="h-7 px-2 text-xs text-surface-500 hover:text-surface-900 gap-1"
                              title="Reschedule activity"
                            >
                              <Clock className="h-3 w-3" />
                              <span className="hidden sm:inline">Reschedule</span>
                            </Button>

                            {/* Delete Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteActivity(act.id)}
                              className="h-7 w-7 p-0 text-surface-400 hover:text-rose-600"
                              title="Remove activity"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Reschedule Popover / Dialog */}
      {rescheduleTarget && (
        <Dialog open={Boolean(rescheduleTarget)} onOpenChange={() => setRescheduleTarget(null)}>
          <DialogContent className="max-w-sm p-6">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary-500" />
                Reschedule Experience
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveReschedule} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="resched-day" className="text-xs font-medium">
                  Move to Day
                </Label>
                <select
                  id="resched-day"
                  value={newDay}
                  onChange={(e) => setNewDay(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {Array.from({ length: Math.max(totalDays, 14) }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Day {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="resched-time" className="text-xs font-medium">
                  Scheduled Time
                </Label>
                <Input
                  id="resched-time"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-200 dark:border-surface-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRescheduleTarget(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  Apply Schedule
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
