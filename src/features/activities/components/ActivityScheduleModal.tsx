import React, { useState } from "react";
import type { Activity, StopWithDetails } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, DollarSign, FileText, MapPin, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ActivityScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity | null;
  stops: StopWithDetails[];
  defaultStopId?: string;
  defaultDayNumber?: number;
  totalTripDays?: number;
  onSchedule: (scheduleData: {
    stopId: string;
    activityId: string;
    dayNumber: number;
    scheduledTime?: string;
    cost: number;
    notes?: string;
  }) => Promise<void> | void;
}

export const ActivityScheduleModal: React.FC<ActivityScheduleModalProps> = ({
  open,
  onOpenChange,
  activity,
  stops,
  defaultStopId,
  defaultDayNumber = 1,
  totalTripDays = 7,
  onSchedule,
}) => {
  const [selectedStopId, setSelectedStopId] = useState<string>(
    defaultStopId || stops[0]?.id || ""
  );
  const [dayNumber, setDayNumber] = useState<number>(defaultDayNumber);
  const [scheduledTime, setScheduledTime] = useState<string>("10:00");
  const [cost, setCost] = useState<number>(activity?.estimated_cost ?? 0);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if activity changes
  React.useEffect(() => {
    if (activity) {
      setCost(activity.estimated_cost);
      if (defaultStopId) {
        setSelectedStopId(defaultStopId);
      } else if (stops.length > 0) {
        // Find stop matching activity city if possible
        const matchingStop = stops.find((s) => s.city_id === activity.city_id);
        setSelectedStopId(matchingStop ? matchingStop.id : stops[0].id);
      }
      setDayNumber(defaultDayNumber);
    }
  }, [activity, defaultStopId, defaultDayNumber, stops]);

  if (!activity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStopId) return;

    try {
      setIsSubmitting(true);
      await onSchedule({
        stopId: selectedStopId,
        activityId: activity.id,
        dayNumber: Number(dayNumber),
        scheduledTime: scheduledTime || undefined,
        cost: Number(cost),
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-500" />
            Schedule Activity
          </DialogTitle>
          <DialogDescription className="text-xs text-surface-500">
            Assign this experience to a specific day and time on your itinerary.
          </DialogDescription>
        </DialogHeader>

        {/* Activity preview preview card */}
        <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-surface-800">
          <img
            src={
              activity.image_url ||
              "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&q=80"
            }
            alt={activity.title}
            className="h-16 w-16 rounded-lg object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] py-0">
                {activity.category}
              </Badge>
              <span className="text-xs text-surface-500">{activity.duration_hours}h duration</span>
            </div>
            <h4 className="font-semibold text-sm text-surface-900 dark:text-surface-100 truncate mt-0.5">
              {activity.title}
            </h4>
            <span className="text-xs font-semibold text-primary-600">
              Est. Cost: {activity.estimated_cost === 0 ? "Free" : `$${activity.estimated_cost}`}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Target Stop / City */}
          <div className="space-y-1.5">
            <Label htmlFor="sched-stop" className="text-xs font-medium flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary-500" />
              City Destination Stop
            </Label>
            <select
              id="sched-stop"
              value={selectedStopId}
              onChange={(e) => setSelectedStopId(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
              required
            >
              {stops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  Stop {stop.stop_order + 1}: {stop.city?.name} ({stop.city?.country})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Day Number */}
            <div className="space-y-1.5">
              <Label htmlFor="sched-day" className="text-xs font-medium flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary-500" />
                Itinerary Day
              </Label>
              <select
                id="sched-day"
                value={dayNumber}
                onChange={(e) => setDayNumber(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {Array.from({ length: Math.max(totalTripDays, 14) }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Day {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Scheduled Time */}
            <div className="space-y-1.5">
              <Label htmlFor="sched-time" className="text-xs font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary-500" />
                Scheduled Time
              </Label>
              <Input
                id="sched-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Cost Override */}
          <div className="space-y-1.5">
            <Label htmlFor="sched-cost" className="text-xs font-medium flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-primary-500" />
              Activity Cost ($ USD)
            </Label>
            <Input
              id="sched-cost"
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="h-9 text-xs"
              placeholder="0.00"
            />
            <p className="text-[11px] text-surface-400">
              You can adjust the expected cost if you have special rates or group discounts.
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="sched-notes" className="text-xs font-medium flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary-500" />
              Notes & Reminders (Optional)
            </Label>
            <Textarea
              id="sched-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Booking ref #12345, meet tour guide at north gate, bring comfortable shoes..."
              className="text-xs min-h-[70px] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200 dark:border-surface-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !selectedStopId}
              className="gap-1.5"
            >
              <Check className="h-4 w-4" />
              {isSubmitting ? "Adding..." : "Add to Itinerary"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
