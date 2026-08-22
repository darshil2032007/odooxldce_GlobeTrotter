import React, { useState } from "react";
import type { StopWithDetails } from "@/types/database";
import {
  Calendar,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Compass,
  Clock,
  Edit2,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateRange, getTripDuration } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StopCardProps {
  stop: StopWithDetails;
  stopIndex: number;
  totalStops: number;
  tripStartDate?: string;
  tripEndDate?: string;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: (stopId: string) => void;
  onUpdateDates?: (stopId: string, arrivalDate?: string | null, departureDate?: string | null) => void;
  onAddActivity?: (stopId: string) => void;
}

export const StopCard: React.FC<StopCardProps> = ({
  stop,
  stopIndex,
  totalStops,
  tripStartDate,
  tripEndDate,
  onMoveUp,
  onMoveDown,
  onDelete,
  onUpdateDates,
  onAddActivity,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [arrivalDate, setArrivalDate] = useState(stop.arrival_date || "");
  const [departureDate, setDepartureDate] = useState(stop.departure_date || "");

  const activityCount = stop.stop_activities?.length || 0;
  const isFirst = stopIndex === 0;
  const isLast = stopIndex === totalStops - 1;

  const durationDays =
    stop.arrival_date && stop.departure_date
      ? getTripDuration(stop.arrival_date, stop.departure_date)
      : null;

  const handleSaveDates = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDates?.(
      stop.id,
      arrivalDate ? arrivalDate : null,
      departureDate ? departureDate : null
    );
    setIsEditDialogOpen(false);
  };

  const confirmDelete = () => {
    onDelete?.(stop.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className="group relative overflow-hidden rounded-xl border border-surface-200 dark:border-surface-800 bg-card p-4 transition-all hover:shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left section: Index badge, thumbnail, title & dates */}
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            {/* Stop Order Indicator */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-sm">
              #{stopIndex + 1}
            </div>

            {/* City Image Thumbnail */}
            <img
              src={
                stop.city?.image_url ||
                "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&q=80"
              }
              alt={stop.city?.name || "City"}
              className="h-14 w-14 rounded-lg object-cover shrink-0 hidden sm:block border border-surface-200 dark:border-surface-700"
            />

            {/* Stop info */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-bold text-base text-surface-900 dark:text-surface-100 truncate">
                  {stop.city?.name}
                </h4>
                <Badge variant="secondary" className="text-xs font-medium py-0">
                  {stop.city?.country}
                </Badge>
                {durationDays !== null && durationDays > 0 && (
                  <Badge variant="outline" className="text-[11px] py-0 text-surface-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {durationDays} {durationDays === 1 ? "day" : "days"}
                  </Badge>
                )}
              </div>

              {/* Dates and Activity count */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary-500" />
                  <span>
                    {stop.arrival_date && stop.departure_date
                      ? formatDateRange(stop.arrival_date, stop.departure_date)
                      : stop.arrival_date
                      ? `Arrive: ${new Date(stop.arrival_date).toLocaleDateString()}`
                      : "Dates not set"}
                  </span>
                </div>

                <span className="text-surface-300">•</span>

                <div className="flex items-center gap-1">
                  <Compass className="h-3.5 w-3.5 text-primary-500" />
                  <span>
                    {activityCount} {activityCount === 1 ? "activity" : "activities"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right section: Action Buttons */}
          <div className="flex items-center justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-100 dark:border-surface-800">
            {/* Add Activity Button */}
            {onAddActivity && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddActivity(stop.id)}
                className="h-8 gap-1 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Activity
              </Button>
            )}

            {/* Edit Dates */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="h-8 w-8 p-0 text-surface-500 hover:text-surface-900"
              title="Edit Stop Dates"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>

            {/* Move Up */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveUp}
              disabled={isFirst}
              className="h-8 w-8 p-0 text-surface-500 hover:text-surface-900 disabled:opacity-30"
              title="Move stop up"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>

            {/* Move Down */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveDown}
              disabled={isLast}
              className="h-8 w-8 p-0 text-surface-500 hover:text-surface-900 disabled:opacity-30"
              title="Move stop down"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>

            {/* Delete Stop */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-8 w-8 p-0 text-surface-500 hover:text-rose-600"
              title="Remove city stop"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Stop Dates Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary-500" />
              Edit Dates for {stop.city?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-surface-500">
              Set the arrival and departure schedule for this destination stop.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDates} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="stop-edit-arr" className="text-xs font-medium">
                  Arrival Date
                </Label>
                <Input
                  id="stop-edit-arr"
                  type="date"
                  min={tripStartDate}
                  max={tripEndDate}
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stop-edit-dep" className="text-xs font-medium">
                  Departure Date
                </Label>
                <Input
                  id="stop-edit-dep"
                  type="date"
                  min={arrivalDate || tripStartDate}
                  max={tripEndDate}
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
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
                Save Dates
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Stop Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base font-bold text-rose-600">
              Remove Stop from Trip?
            </DialogTitle>
            <DialogDescription className="text-xs text-surface-500">
              Are you sure you want to remove{" "}
              <strong className="text-surface-900 dark:text-surface-100">{stop.city?.name}</strong>{" "}
              from your itinerary? Any activities scheduled under this stop will also be removed.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              className="gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove Stop
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
