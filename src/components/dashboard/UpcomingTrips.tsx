import { Link } from "react-router-dom";
import { ArrowRight, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trips/TripCard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { TripCardData } from "@/types";

interface UpcomingTripsProps {
  trips?: TripCardData[];
  isLoading?: boolean;
  onDelete?: (trip: TripCardData) => void;
}

export function UpcomingTrips({ trips, isLoading, onDelete }: UpcomingTripsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-surface-900">Upcoming Trips</h2>
          <p className="text-xs text-surface-500">Your scheduled future travel plans</p>
        </div>
        <Button variant="ghost" size="sm" asChild className="gap-1 text-primary-600">
          <Link to="/trips">
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl overflow-hidden border border-surface-200 p-4 space-y-3">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : !trips || trips.length === 0 ? (
        <EmptyState
          icon={Plane}
          title="No upcoming trips"
          description="You don't have any upcoming trips planned. Time to start exploring!"
          actionLabel="Plan New Trip"
          actionHref="/trips/new"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.slice(0, 3).map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
