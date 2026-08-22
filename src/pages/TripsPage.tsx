import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusCircle, LayoutGrid, List, Sparkles, Map } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trips/TripCard";
import { TripFilters } from "@/components/trips/TripFilters";
import { DeleteTripDialog } from "@/components/trips/DeleteTripDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrips, useDeleteTrip } from "@/hooks/useTrips";
import { useAuth } from "@/hooks/useAuth";
import { cloneTrip } from "@/features/sharing";
import { AITripGeneratorModal } from "@/components/ai/AITripGeneratorModal";
import { toast } from "sonner";
import type { TripCardData } from "@/types";

export function TripsPage() {
  const navigate = useNavigate();
  const { data: trips, isLoading, isError, refetch } = useTrips();
  const deleteTripMutation = useDeleteTrip();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTripToDelete, setSelectedTripToDelete] = useState<TripCardData | null>(null);

  // Filtering & Sorting logic
  const filteredTrips = useMemo(() => {
    if (!trips) return [];

    return trips
      .filter((trip) => {
        const matchesSearch =
          trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (trip.description && trip.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === "all" || trip.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "date-asc") {
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        }
        if (sortBy === "date-desc") {
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        }
        if (sortBy === "budget-desc") {
          return b.budgetTarget - a.budgetTarget;
        }
        if (sortBy === "name-asc") {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [trips, searchQuery, statusFilter, sortBy]);

  const handleEdit = (trip: TripCardData) => {
    navigate(`/trips/${trip.id}`);
  };

  const { user } = useAuth();

  const handleDuplicate = async (trip: TripCardData) => {
    if (!user) {
      toast.info("Please log in to duplicate trips.");
      return;
    }
    try {
      const newTripId = await cloneTrip(trip.id, user.id);
      toast.success(`Trip "${trip.name}" duplicated successfully!`);
      refetch();
      navigate(`/trips/${newTripId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to duplicate trip");
    }
  };

  const handleDeleteConfirm = (trip: TripCardData) => {
    deleteTripMutation.mutate(trip.id, {
      onSuccess: () => {
        toast.success(`Trip "${trip.name}" deleted successfully`);
        setSelectedTripToDelete(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to delete trip");
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="My Trips"
        description="Manage, plan, and organize all your travel itineraries"
        action={
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center bg-surface-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-primary-600 shadow-sm"
                    : "text-surface-500 hover:text-surface-900"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white text-primary-600 shadow-sm"
                    : "text-surface-500 hover:text-surface-900"
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsAIModalOpen(true)}
              className="gap-2 text-xs font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              ✨ Plan with AI
            </Button>

            <Button asChild className="gap-2 shadow-md">
              <Link to="/trips/new">
                <PlusCircle className="h-4 w-4" />
                Plan New Trip
              </Link>
            </Button>
          </div>
        }
      />

      <AITripGeneratorModal
        open={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
      />

      {/* Filters & Search */}
      <TripFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {/* Trip List / Grid */}
      {isLoading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-surface-200 p-4 space-y-3 bg-white"
            >
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Map}
          title="Unable to load trips"
          description="There was an error fetching your trips. Please try again."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : filteredTrips.length === 0 ? (
        <EmptyState
          icon={Map}
          title={searchQuery || statusFilter !== "all" ? "No matching trips" : "No trips created yet"}
          description={
            searchQuery || statusFilter !== "all"
              ? "Try adjusting your search query or status filter."
              : "Get started by planning your first multi-city travel itinerary!"
          }
          actionLabel="Plan New Trip"
          onAction={() => navigate("/trips/new")}
        />
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              : "grid gap-4 grid-cols-1"
          }
        >
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onEdit={handleEdit}
              onDelete={setSelectedTripToDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
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
