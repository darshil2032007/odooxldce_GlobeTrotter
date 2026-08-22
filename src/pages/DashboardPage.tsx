import { useState } from "react";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { PlanNewTripCTA } from "@/components/dashboard/PlanNewTripCTA";
import { BudgetSummaryCards } from "@/components/dashboard/BudgetSummaryCards";
import { UpcomingTrips } from "@/components/dashboard/UpcomingTrips";
import { RecentTrips } from "@/components/dashboard/RecentTrips";
import { DestinationRecommender } from "@/features/recommendations";
import { DeleteTripDialog } from "@/components/trips/DeleteTripDialog";
import {
  useUpcomingTrips,
  useRecentTrips,
  useBudgetSummary,
  useDeleteTrip,
} from "@/hooks/useTrips";
import { toast } from "sonner";
import type { TripCardData } from "@/types";

export function DashboardPage() {
  const { data: upcomingTrips, isLoading: upcomingLoading } = useUpcomingTrips();
  const { data: recentTrips, isLoading: recentLoading } = useRecentTrips();
  const { data: budgetSummary } = useBudgetSummary();
  const deleteTripMutation = useDeleteTrip();

  const [selectedTripToDelete, setSelectedTripToDelete] = useState<TripCardData | null>(null);

  const handleDeleteConfirm = (trip: TripCardData) => {
    deleteTripMutation.mutate(trip.id, {
      onSuccess: () => {
        toast.success(`Trip "${trip.name}" deleted`);
        setSelectedTripToDelete(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to delete trip");
      },
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <WelcomeSection />

      {/* Primary CTA */}
      <PlanNewTripCTA />

      {/* Budget Summary Cards */}
      <BudgetSummaryCards summary={budgetSummary} />

      {/* Upcoming Trips */}
      <UpcomingTrips
        trips={upcomingTrips}
        isLoading={upcomingLoading}
        onDelete={setSelectedTripToDelete}
      />

      {/* AI Destination Recommendations with Deterministic Scoring */}
      <DestinationRecommender />

      {/* Recent Trips */}
      <RecentTrips
        trips={recentTrips}
        isLoading={recentLoading}
        onDelete={setSelectedTripToDelete}
      />

      {/* Delete Confirmation Modal */}
      <DeleteTripDialog
        trip={selectedTripToDelete}
        open={!!selectedTripToDelete}
        onOpenChange={(open) => !open && setSelectedTripToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteTripMutation.isPending}
      />
    </div>
  );
}
