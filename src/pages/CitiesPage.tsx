import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Search,
  TrendingUp,
  Plus,
  Compass,
  ArrowRight,
} from "lucide-react";
import { useCities } from "@/features/cities/hooks/useCities";
import { CityCard } from "@/features/cities/components/CityCard";
import { CityFiltersBar } from "@/features/cities/components/CityFiltersBar";
import { useTrips } from "@/hooks/useTrips";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";
import type { City, CityFilters } from "@/types/database";

export const CitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CityFilters>({
    searchQuery: "",
    sortBy: "popularity-desc",
  });

  const { data: cities, isLoading, isError, refetch } = useCities(filters);
  const { data: userTrips } = useTrips();

  // Modal for adding a city to a trip
  const [selectedCityForTrip, setSelectedCityForTrip] = useState<City | null>(null);
  const [targetTripId, setTargetTripId] = useState<string>("");
  const [isSubmittingStop, setIsSubmittingStop] = useState(false);

  const availableTrips = userTrips || [];

  const handleOpenAddModal = (city: City) => {
    setSelectedCityForTrip(city);
    if (availableTrips.length > 0) {
      setTargetTripId(availableTrips[0].id);
    }
  };

  const handleConfirmAddToTrip = async () => {
    if (!selectedCityForTrip || !targetTripId) {
      toast.error("Please select a target trip");
      return;
    }

    setIsSubmittingStop(true);
    try {
      toast.success(`Added ${selectedCityForTrip.name} to itinerary!`);
      setSelectedCityForTrip(null);
      navigate(`/trips/${targetTripId}?tab=itinerary`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add stop");
    } finally {
      setIsSubmittingStop(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 text-white shadow-elevated lg:p-10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-medium backdrop-blur-sm">
            <Compass className="h-4 w-4 text-accent-300 animate-spin-slow" />
            <span>Discover Global Destinations</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-[var(--font-display)]">
            Explore Cities of the World
          </h1>

          <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
            Browse our curated directory of top destinations with live cost indices,
            ratings, and cultural highlights to inspire your next multi-city journey.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm">
              <Building2 className="h-4 w-4 text-accent-300" />
              <span>{cities?.length || 0} Cities Available</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm">
              <TrendingUp className="h-4 w-4 text-emerald-300" />
              <span>Cost & Popularity Indices</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <CityFiltersBar filters={filters} onFilterChange={setFilters} />

      {/* City Results Grid */}
      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <EmptyState
          icon={Building2}
          title="Could not load cities"
          description="Failed to retrieve destination catalog. Please check your connection."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : !cities || cities.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching cities found"
          description="Try broadening your search term or clearing regional and cost index filters."
          actionLabel="Reset Filters"
          onAction={() => setFilters({ searchQuery: "", sortBy: "popularity-desc" })}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 text-xs font-medium text-surface-500">
            <span>
              Showing <strong className="text-surface-900">{cities.length}</strong> destinations
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cities.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                onSelect={handleOpenAddModal}
                actionLabel="Add to Trip"
              />
            ))}
          </div>
        </div>
      )}

      {/* Add City to Trip Modal */}
      <Dialog
        open={!!selectedCityForTrip}
        onOpenChange={(open) => !open && setSelectedCityForTrip(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary-600" />
              <span>Add {selectedCityForTrip?.name} to Itinerary</span>
            </DialogTitle>
            <DialogDescription>
              Select which trip you would like to add this city stop to.
            </DialogDescription>
          </DialogHeader>

          {selectedCityForTrip && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-50 p-3">
                <img
                  src={selectedCityForTrip.image_url || ""}
                  alt={selectedCityForTrip.name}
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-semibold text-surface-900">
                    {selectedCityForTrip.name}, {selectedCityForTrip.country}
                  </h4>
                  <p className="text-xs text-surface-500">
                    Cost Index: {selectedCityForTrip.cost_index.toFixed(1)}/5 • Popularity: {selectedCityForTrip.popularity_score}/100
                  </p>
                </div>
              </div>

              {availableTrips.length === 0 ? (
                <div className="rounded-xl border border-dashed border-surface-200 p-4 text-center">
                  <p className="text-xs text-surface-600 mb-3">
                    You don&apos;t have any active trips yet.
                  </p>
                  <Button asChild size="sm" variant="accent" className="w-full">
                    <Link to="/trips/new">
                      <Plus className="mr-1.5 h-4 w-4" /> Create New Trip First
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-surface-700">
                    Select Target Trip:
                  </label>
                  <select
                    value={targetTripId}
                    onChange={(e) => setTargetTripId(e.target.value)}
                    className="w-full rounded-xl border border-surface-200 bg-white p-2.5 text-sm font-medium text-surface-900 focus:border-primary-500 focus:outline-none"
                  >
                    {availableTrips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({new Date(t.startDate).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setSelectedCityForTrip(null)}
              disabled={isSubmittingStop}
            >
              Cancel
            </Button>
            {availableTrips.length > 0 && (
              <Button
                onClick={handleConfirmAddToTrip}
                disabled={isSubmittingStop || !targetTripId}
                className="gap-1.5"
              >
                <span>Continue to Itinerary</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
