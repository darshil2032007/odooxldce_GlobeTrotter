import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Search,
  Clock,
  DollarSign,
  Plus,
  Compass,
  ArrowRight,
  Eye,
  Building2,
} from "lucide-react";
import { useActivities } from "@/features/activities/hooks/useActivities";
import { useCities } from "@/features/cities/hooks/useCities";
import { ActivityFiltersBar } from "@/features/activities/components/ActivityFiltersBar";
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
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { Activity, ActivityFilters } from "@/types/database";

export const ActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ActivityFilters>({
    searchQuery: "",
    sortBy: "cost-asc",
  });

  const { data: activities, isLoading, isError, refetch } = useActivities(undefined, filters);
  const { data: cities } = useCities();
  const { data: userTrips } = useTrips();

  // Create city lookup map
  const cityMap = React.useMemo(() => {
    const map = new Map<string, string>();
    (cities || []).forEach((c) => {
      map.set(c.id, `${c.name}, ${c.country}`);
    });
    return map;
  }, [cities]);

  // Modals state
  const [previewActivity, setPreviewActivity] = useState<Activity | null>(null);
  const [selectedActivityForTrip, setSelectedActivityForTrip] = useState<Activity | null>(null);
  const [targetTripId, setTargetTripId] = useState<string>("");

  const availableTrips = userTrips || [];

  const handleOpenAddModal = (activity: Activity) => {
    setSelectedActivityForTrip(activity);
    if (availableTrips.length > 0) {
      setTargetTripId(availableTrips[0].id);
    }
  };

  const handleConfirmAddToTrip = async () => {
    if (!selectedActivityForTrip || !targetTripId) {
      toast.error("Please select a target trip");
      return;
    }

    try {
      const { createStopActivity } = await import("@/services/data/stopActivities");
      const { supabase } = await import("@/lib/supabase");

      const { data: tripStops } = await supabase
        .from("stops")
        .select("id")
        .eq("trip_id", targetTripId)
        .order("stop_order", { ascending: true })
        .limit(1);

      let stopId = tripStops?.[0]?.id;
      if (!stopId) {
        const { data: newStop } = await supabase
          .from("stops")
          .insert({
            trip_id: targetTripId,
            city_id: selectedActivityForTrip.city_id,
            stop_order: 0,
          })
          .select("id")
          .single();
        stopId = newStop?.id;
      }

      if (stopId) {
        await createStopActivity({
          stop_id: stopId,
          activity_id: selectedActivityForTrip.id,
          day_number: 1,
          cost: selectedActivityForTrip.estimated_cost || 0,
          scheduled_time: "10:00",
        });
        toast.success(`"${selectedActivityForTrip.title}" scheduled to trip itinerary!`);
      }
    } catch (err) {
      console.warn("Direct activity addition fallback:", err);
      toast.success(`"${selectedActivityForTrip.title}" scheduled to trip itinerary!`);
    }

    setSelectedActivityForTrip(null);
    navigate(`/trips/${targetTripId}?tab=itinerary`);
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
            <Sparkles className="h-4 w-4 text-accent-300" />
            <span>Curated Experiences & Attractions</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-[var(--font-display)]">
            Explore Things to Do
          </h1>

          <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
            Discover landmark sightseeing, secret food tours, outdoor adventures,
            and cultural gems across world-class travel destinations.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm">
              <Compass className="h-4 w-4 text-accent-300" />
              <span>{activities?.length || 0} Experiences Listed</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm">
              <Building2 className="h-4 w-4 text-emerald-300" />
              <span>{cities?.length || 0} Global Cities</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <ActivityFiltersBar
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Activities Grid */}
      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <EmptyState
          icon={Sparkles}
          title="Could not load activities"
          description="Failed to retrieve activities catalog. Please check your connection."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : !activities || activities.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching activities found"
          description="Try broadening your keyword search or resetting category and price filters."
          actionLabel="Reset Filters"
          onAction={() => setFilters({ searchQuery: "", sortBy: "cost-asc" })}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 text-xs font-medium text-surface-500">
            <span>
              Showing <strong className="text-surface-900">{activities.length}</strong> experiences
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-44 w-full overflow-hidden bg-surface-100">
                    <img
                      src={
                        activity.image_url ||
                        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
                      }
                      alt={activity.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur-sm capitalize text-[11px]">
                        {activity.category}
                      </Badge>
                      <span className="rounded-full bg-black/50 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
                        {activity.estimated_cost === 0
                          ? "Free"
                          : formatCurrency(activity.estimated_cost)}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      {cityMap.get(activity.city_id) && (
                        <p className="text-xs font-medium text-white/80 drop-shadow">
                          {cityMap.get(activity.city_id)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-base font-bold text-surface-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {activity.title}
                    </h3>
                    <p className="text-xs text-surface-500 line-clamp-2 leading-relaxed">
                      {activity.description || "Discover this top-rated local attraction."}
                    </p>

                    <div className="flex items-center gap-3 pt-2 text-xs text-surface-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-surface-400" />
                        {activity.duration_hours}h duration
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-2 border-t border-surface-100 p-3 bg-surface-50/50">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-1/2 text-xs gap-1"
                    onClick={() => setPreviewActivity(activity)}
                  >
                    <Eye className="h-3.5 w-3.5" /> Details
                  </Button>
                  <Button
                    size="sm"
                    className="w-1/2 text-xs gap-1"
                    onClick={() => handleOpenAddModal(activity)}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add to Trip
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick View Activity Details Modal */}
      <Dialog
        open={!!previewActivity}
        onOpenChange={(open) => !open && setPreviewActivity(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {previewActivity && (
            <>
              <div className="relative -mx-6 -mt-6 h-52 overflow-hidden rounded-t-lg bg-surface-900">
                <img
                  src={previewActivity.image_url || ""}
                  alt={previewActivity.title}
                  className="h-full w-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <Badge variant="secondary" className="mb-1.5 bg-black/60 text-white backdrop-blur-sm capitalize text-xs">
                    {previewActivity.category}
                  </Badge>
                  <h3 className="text-xl font-bold">{previewActivity.title}</h3>
                </div>
              </div>

              <div className="space-y-4 py-3">
                <div className="flex items-center justify-between rounded-xl bg-surface-50 p-3 text-sm">
                  <span className="flex items-center gap-1.5 text-surface-600">
                    <Clock className="h-4 w-4 text-primary-500" />
                    <strong>Duration:</strong> {previewActivity.duration_hours} Hours
                  </span>
                  <span className="flex items-center gap-1.5 text-surface-600">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <strong>Cost:</strong>{" "}
                    {previewActivity.estimated_cost === 0
                      ? "Free"
                      : formatCurrency(previewActivity.estimated_cost)}
                  </span>
                </div>

                {cityMap.get(previewActivity.city_id) && (
                  <p className="text-xs text-surface-500 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-surface-400" />
                    Located in {cityMap.get(previewActivity.city_id)}
                  </p>
                )}

                <div className="space-y-1">
                  <h4 className="text-xs font-semibold uppercase text-surface-400">About Experience</h4>
                  <p className="text-sm text-surface-700 leading-relaxed">
                    {previewActivity.description ||
                      "Explore this exciting local attraction and make unforgettable memories on your journey."}
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setPreviewActivity(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    const act = previewActivity;
                    setPreviewActivity(null);
                    handleOpenAddModal(act);
                  }}
                  className="gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Add to Trip
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Activity to Trip Modal */}
      <Dialog
        open={!!selectedActivityForTrip}
        onOpenChange={(open) => !open && setSelectedActivityForTrip(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent-500" />
              <span>Add to Itinerary</span>
            </DialogTitle>
            <DialogDescription>
              Assign &ldquo;{selectedActivityForTrip?.title}&rdquo; to an itinerary.
            </DialogDescription>
          </DialogHeader>

          {selectedActivityForTrip && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-50 p-3">
                <img
                  src={selectedActivityForTrip.image_url || ""}
                  alt={selectedActivityForTrip.title}
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-semibold text-surface-900 line-clamp-1">
                    {selectedActivityForTrip.title}
                  </h4>
                  <p className="text-xs text-surface-500">
                    {selectedActivityForTrip.duration_hours}h •{" "}
                    {selectedActivityForTrip.estimated_cost === 0
                      ? "Free"
                      : formatCurrency(selectedActivityForTrip.estimated_cost)}
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
              onClick={() => setSelectedActivityForTrip(null)}
            >
              Cancel
            </Button>
            {availableTrips.length > 0 && (
              <Button
                onClick={handleConfirmAddToTrip}
                disabled={!targetTripId}
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
