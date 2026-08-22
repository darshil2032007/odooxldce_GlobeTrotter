import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { TripCardData } from "@/types";

interface DeleteTripDialogProps {
  trip: TripCardData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (trip: TripCardData) => void;
  loading?: boolean;
}

export function DeleteTripDialog({
  trip,
  open,
  onOpenChange,
  onConfirm,
  loading,
}: DeleteTripDialogProps) {
  if (!trip) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-50 text-danger-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Delete Trip</DialogTitle>
              <DialogDescription className="mt-1">
                Are you sure you want to delete &ldquo;{trip.name}&rdquo;?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="text-sm text-surface-500 py-2">
          This action cannot be undone. All itinerary details, city stops, and associated budgets will be permanently deleted.
        </p>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => onConfirm(trip)} disabled={loading}>
            {loading ? "Deleting..." : "Delete Trip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
