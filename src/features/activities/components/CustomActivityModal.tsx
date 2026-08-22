import React, { useState } from "react";
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
import { Sparkles, Calendar, Clock, DollarSign, FileText, MapPin, Check } from "lucide-react";

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
  const [category, setCategory] = useState("Custom Plan");
  const [selectedStopId, setSelectedStopId] = useState<string>(
    defaultStopId || stops[0]?.id || ""
  );
  const [dayNumber, setDayNumber] = useState<number>(defaultDayNumber);
  const [scheduledTime, setScheduledTime] = useState<string>("12:00");
  const [cost, setCost] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (defaultStopId) setSelectedStopId(defaultStopId);
    setDayNumber(defaultDayNumber);
  }, [defaultStopId, defaultDayNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedStopId) return;

    try {
      setIsSubmitting(true);
      await onSave({
        stopId: selectedStopId,
        title: title.trim(),
        category,
        cost: Number(cost),
        dayNumber: Number(dayNumber),
        scheduledTime: scheduledTime || undefined,
        notes: notes.trim() || undefined,
      });
      setTitle("");
      setNotes("");
      setCost(0);
      onOpenChange(false);
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

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="custom-title" className="text-xs font-medium">
              Activity Title *
            </Label>
            <Input
              id="custom-title"
              placeholder="e.g. Sunset Dinner at Cliffside Bistro, Museum Visit..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs h-9"
              required
            />
          </div>

          {/* Category & Stop */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="custom-cat" className="text-xs font-medium">
                Category
              </Label>
              <select
                id="custom-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="Food & Dining">Food & Dining</option>
                <option value="Sightseeing">Sightseeing</option>
                <option value="Adventure">Adventure</option>
                <option value="Culture & History">Culture & History</option>
                <option value="Nature">Nature</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Wellness">Wellness</option>
                <option value="Custom Plan">Custom Plan</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="custom-stop" className="text-xs font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary-500" />
                City Stop *
              </Label>
              <select
                id="custom-stop"
                value={selectedStopId}
                onChange={(e) => setSelectedStopId(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              >
                {stops.map((stop) => (
                  <option key={stop.id} value={stop.id}>
                    {stop.city?.name || `Stop ${stop.stop_order + 1}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Day & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="custom-day" className="text-xs font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3 text-primary-500" />
                Day Number
              </Label>
              <select
                id="custom-day"
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

            <div className="space-y-1.5">
              <Label htmlFor="custom-time" className="text-xs font-medium flex items-center gap-1">
                <Clock className="h-3 w-3 text-primary-500" />
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

          {/* Cost */}
          <div className="space-y-1.5">
            <Label htmlFor="custom-cost" className="text-xs font-medium flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-primary-500" />
              Estimated Cost ($ USD)
            </Label>
            <Input
              id="custom-cost"
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="h-9 text-xs"
              placeholder="0.00"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="custom-notes" className="text-xs font-medium flex items-center gap-1">
              <FileText className="h-3 w-3 text-primary-500" />
              Notes / Location
            </Label>
            <Textarea
              id="custom-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Address, confirmation number, or notes..."
              className="text-xs min-h-[60px] resize-none"
            />
          </div>

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
              disabled={isSubmitting || !title.trim()}
              className="gap-1.5"
            >
              <Check className="h-4 w-4" />
              {isSubmitting ? "Creating..." : "Add Activity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
