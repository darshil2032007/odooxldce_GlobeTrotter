import React, { useState } from "react";
import type { StopActivityWithDetails } from "@/types/database";
import {
  Clock,
  Trash2,
  ChevronUp,
  ChevronDown,
  Edit2,
  Check,
  FileText,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { getCategoryColor } from "../utils/categoryColors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ActivityItemProps {
  item: StopActivityWithDetails;
  onToggleComplete?: (id: string, isCompleted: boolean) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: { scheduled_time?: string | null; cost?: number; notes?: string | null; day_number?: number }) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  hasConflict?: boolean;
  conflictMessage?: string;
  cityName?: string;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  item,
  onToggleComplete,
  onDelete,
  onUpdate,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
  hasConflict = false,
  conflictMessage,
  cityName,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [time, setTime] = useState(item.scheduled_time || "10:00");
  const [cost, setCost] = useState(item.cost ?? item.activity?.estimated_cost ?? 0);
  const [notes, setNotes] = useState(item.notes || "");
  const [dayNumber, setDayNumber] = useState(item.day_number);

  const title = item.activity?.title || item.notes?.split("\n")[0] || "Custom Activity";
  const category = item.activity?.category || "Custom Plan";
  const duration = item.activity?.duration_hours;
  const image = item.activity?.image_url;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate?.(item.id, {
      scheduled_time: time || null,
      cost: Number(cost),
      notes: notes.trim() || null,
      day_number: Number(dayNumber),
    });
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <div
        className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
          item.is_completed
            ? "bg-surface-50/70 dark:bg-surface-900/30 border-surface-200 dark:border-surface-800 opacity-60"
            : hasConflict
            ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700 shadow-sm"
            : "bg-card border-surface-200 dark:border-surface-800 hover:border-primary-300 dark:hover:border-primary-800 hover:shadow-sm"
        }`}
      >
        {/* Left Section: Checkbox, Time, and Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Completion Checkbox */}
          <button
            onClick={() => onToggleComplete?.(item.id, !item.is_completed)}
            className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
              item.is_completed
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "border-surface-300 dark:border-surface-600 hover:border-primary-500"
            }`}
            title={item.is_completed ? "Mark as Incomplete" : "Mark as Completed"}
          >
            {item.is_completed && <Check className="h-3.5 w-3.5" />}
          </button>

          {/* Time Badge */}
          <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-md bg-surface-100 dark:bg-surface-800 text-xs font-mono font-medium text-surface-700 dark:text-surface-300">
            <Clock className="h-3 w-3 text-primary-500" />
            <span>{item.scheduled_time ? item.scheduled_time.slice(0, 5) : "--:--"}</span>
          </div>

          {/* Thumbnail if catalog activity */}
          {image && (
            <img
              src={image}
              alt={title}
              className="h-10 w-10 rounded-lg object-cover hidden md:block shrink-0"
            />
          )}

          {/* Title & Details */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4
                className={`font-semibold text-sm truncate ${
                  item.is_completed
                    ? "line-through text-surface-400"
                    : "text-surface-900 dark:text-surface-100"
                }`}
              >
                {title}
              </h4>
              <Badge
                variant="outline"
                className={`text-[10px] py-0 ${getCategoryColor(category)}`}
              >
                {category}
              </Badge>
              {duration && (
                <span className="text-[11px] text-surface-500 flex items-center gap-1">
                  ({duration}h)
                </span>
              )}
              {cityName && (
                <span className="text-[11px] text-surface-400 flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  {cityName}
                </span>
              )}
            </div>

            {/* Notes display */}
            {item.notes && (
              <p className="text-xs text-surface-500 flex items-center gap-1 line-clamp-1 italic">
                <FileText className="h-3 w-3 shrink-0 text-surface-400" />
                {item.notes}
              </p>
            )}

            {/* Validation Conflict Warning */}
            {hasConflict && conflictMessage && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium pt-0.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{conflictMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Cost & Action Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-100 dark:border-surface-800">
          <div className="text-right">
            <span className="font-bold text-xs sm:text-sm text-surface-900 dark:text-surface-100">
              {item.cost === 0 ? "Free" : formatCurrency(item.cost)}
            </span>
          </div>

          {/* Action Button Controls */}
          <div className="flex items-center gap-1">
            {/* Move Up / Down Buttons */}
            {onMoveUp && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveUp}
                disabled={isFirst}
                className="h-7 w-7 p-0 text-surface-400 hover:text-surface-700 disabled:opacity-30"
                title="Move earlier"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
            {onMoveDown && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveDown}
                disabled={isLast}
                className="h-7 w-7 p-0 text-surface-400 hover:text-surface-700 disabled:opacity-30"
                title="Move later"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}

            {/* Edit Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="h-7 w-7 p-0 text-surface-400 hover:text-surface-700"
              title="Edit scheduled time / notes"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>

            {/* Delete Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(item.id)}
              className="h-7 w-7 p-0 text-surface-400 hover:text-rose-600"
              title="Remove activity from day"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base font-bold">Edit Scheduled Activity</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-day" className="text-xs">
                  Day Number
                </Label>
                <Input
                  id="edit-day"
                  type="number"
                  min="1"
                  max="30"
                  value={dayNumber}
                  onChange={(e) => setDayNumber(Number(e.target.value))}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-time" className="text-xs">
                  Scheduled Time
                </Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-cost" className="text-xs">
                Activity Cost ($ USD)
              </Label>
              <Input
                id="edit-cost"
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-notes" className="text-xs">
                Notes & Reminders
              </Label>
              <Textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Booking references, meetup instructions..."
                className="text-xs min-h-[60px] resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-200 dark:border-surface-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="gap-1.5">
                <Check className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
