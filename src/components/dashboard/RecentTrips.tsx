import { Link } from "react-router-dom";
import { ArrowRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trips/TripCard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { TripCardData } from "@/types";

interface RecentTripsProps {
  trips?: TripCardData[];
  isLoading?: boolean;
  onDelete?: (trip: TripCardData) => void;
}

export function RecentTrips({ trips, isLoading, onDelete }: RecentTripsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-surface-900">Recent & Past Trips</h2>
          <p className="text-xs text-surface-500">Ongoing journeys and past travel memories</p>
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
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-xl overflow-hidden border border-surface-200 p-4 space-y-3">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : !trips || trips.length === 0 ? (
        <EmptyState
          icon={History}
          title="No recent trips"
          description="Your completed and ongoing trips will show up here."
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
