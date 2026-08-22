import React, { useState, useEffect } from "react";
import type { StopWithDetails } from "@/types/database";
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
import { Sparkles, Calendar, Clock, DollarSign, FileText, MapPin, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CustomActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stops: StopWithDetails[];
  defaultStopId?: string;
  defaultDayNumber?: number;
  totalTripDays?: number;
  onSave: (data: {
    stopId: string;
    title: string;
    category: string;
    cost: number;
    dayNumber: number;
    scheduledTime?: string;
    notes?: string;
  }) => Promise<void> | void;
}

export const CustomActivityModal: React.FC<CustomActivityModalProps> = ({
  open,
  onOpenChange,
  stops,
  defaultStopId,
  defaultDayNumber = 1,
  totalTripDays = 7,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Sightseeing");
  const [selectedStopId, setSelectedStopId] = useState<string>(
    defaultStopId || stops[0]?.id || ""
  );
  const [dayNumber, setDayNumber] = useState<number>(defaultDayNumber);
  const [scheduledTime, setScheduledTime] = useState<string>("12:00");
  const [cost, setCost] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedStopId(defaultStopId || (stops.length > 0 ? stops[0].id : ""));
      setDayNumber(defaultDayNumber || 1);
    }
  }, [open, defaultStopId, defaultDayNumber, stops]);

  const effectiveStopId = selectedStopId || defaultStopId || (stops.length > 0 ? stops[0]?.id : "");
  const hasStops = stops && stops.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter an activity title.");
      return;
    }
    if (!effectiveStopId) {
      toast.error("Please select a destination city stop.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        stopId: effectiveStopId,
        title: title.trim(),
        category,
        cost: Number(cost) || 0,
        dayNumber: Number(dayNumber) || 1,
        scheduledTime: scheduledTime || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success(`Created custom activity "${title.trim()}"`);
      setTitle("");
      setNotes("");
      setCost(0);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create activity");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Add Custom Activity
          </DialogTitle>
          <DialogDescription className="text-xs text-surface-500">
            Create a personalized event, dinner, tour, or custom plan for your trip.
          </DialogDescription>
        </DialogHeader>

        {!hasStops && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>This trip has no destination city stops yet. Please add a destination stop first.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="custom-title" className="text-xs font-medium">
              Activity Title *
            </Label>
            <Input
              id="custom-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunset Dinner at Fisherman's Wharf"
              className="text-xs"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="custom-category" className="text-xs font-medium">
              Category
            </Label>
            <select
              id="custom-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-surface-200 dark:border-surface-800 bg-background p-2 text-xs font-medium focus:border-primary-500 focus:outline-none"
            >
              <option value="Sightseeing">Sightseeing</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Culture & History">Culture & History</option>
              <option value="Adventure">Adventure & Outdoors</option>
              <option value="Relaxation">Relaxation & Leisure</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment & Nightlife</option>
            </select>
          </div>

          {/* Stop selector */}
          <div className="space-y-1.5">
            <Label htmlFor="custom-stop" className="text-xs font-medium flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary-500" />
              Destination City Stop *
            </Label>
            <select
              id="custom-stop"
              value={effectiveStopId}
              onChange={(e) => setSelectedStopId(e.target.value)}
              disabled={!hasStops}
              className="w-full rounded-lg border border-surface-200 dark:border-surface-800 bg-background p-2 text-xs font-medium focus:border-primary-500 focus:outline-none disabled:opacity-50"
              required
            >
              {hasStops ? (
                stops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.city?.name ? `${s.city.name}, ${s.city.country}` : `Stop ${s.stop_order + 1}`}
                  </option>
                ))
              ) : (
                <option value="">No stops available</option>
              )}
            </select>
          </div>

          {/* Schedule Timing & Day */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="custom-day" className="text-xs font-medium flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary-500" />
                Itinerary Day
              </Label>
              <select
                id="custom-day"
                value={dayNumber}
                onChange={(e) => setDayNumber(Number(e.target.value))}
                className="w-full rounded-lg border border-surface-200 dark:border-surface-800 bg-background p-2 text-xs font-medium focus:border-primary-500 focus:outline-none"
              >
                {Array.from({ length: Math.max(totalTripDays, 1) }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Day {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Scheduled Time */}
            <div className="space-y-1.5">
              <Label htmlFor="custom-time" className="text-xs font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary-500" />
                Time
              </Label>
              <Input
                id="custom-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Estimated Cost */}
          <div className="space-y-1.5">
            <Label htmlFor="custom-cost" className="text-xs font-medium flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-primary-500" />
              Estimated Cost
            </Label>
            <Input
              id="custom-cost"
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              placeholder="0.00"
              className="h-9 text-xs"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="custom-notes" className="text-xs font-medium flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-primary-500" />
              Notes / Location
            </Label>
            <Textarea
              id="custom-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any reminders, booking details, or location info..."
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-200 dark:border-surface-800">
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
              disabled={isSubmitting || !title.trim() || !effectiveStopId}
              className="gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold"
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
