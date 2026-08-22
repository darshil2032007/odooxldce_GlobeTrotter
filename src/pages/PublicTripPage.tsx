import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  MapPin,
  Copy,
  Compass,
  Lock,
  ArrowRight,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { getPublicTripBySlug } from "@/features/sharing/services/sharingService";
import { cloneTrip } from "@/features/sharing/services/cloneTripService";
import { calculateTripBudget } from "@/features/budget/engine/calculator";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDateRange, getTripDuration } from "@/lib/utils";
import { toast } from "sonner";

export function PublicTripPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isCloning, setIsCloning] = useState(false);

  const {
    data: trip,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public-trip", slug],
    queryFn: async () => {
      if (!slug) return null;
      return await getPublicTripBySlug(slug);
    },
    enabled: !!slug,
  });

  const budget = trip ? calculateTripBudget(trip) : null;
  const durationDays = trip
    ? getTripDuration(trip.start_date, trip.end_date)
    : 0;

  const cloneMutation = useMutation({
    mutationFn: async () => {
      if (!trip) throw new Error("Trip not found");
      if (!user) {
        // Redirect to login if user is not authenticated
        navigate(`/login?redirect=/share/${slug}`);
        return null;
      }
      return await cloneTrip(trip, user.id);
    },
    onSuccess: (newTripId) => {
      if (newTripId) {
        toast.success("Trip cloned to your account! Redirecting to your copy...");
        queryClient.invalidateQueries({ queryKey: ["trips"] });
        navigate(`/trips/${newTripId}`);
      }
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to copy trip to your account"
      );
    },
    onSettled: () => {
      setIsCloning(false);
    },
  });

  const handleCopyTrip = () => {
    if (!user) {
      toast.info("Please log in or create an account to copy this trip.");
      navigate(`/login?redirect=/share/${slug}`);
      return;
    }
    setIsCloning(true);
    cloneMutation.mutate();
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !trip) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4 animate-fade-in">
        <div className="rounded-full bg-surface-100 dark:bg-surface-800 p-5 text-surface-400">
          <Lock className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Trip Unavailable or Private
        </h2>
        <p className="text-sm text-surface-500">
          This itinerary is either marked as private by its creator or does not exist.
        </p>
        <Button asChild className="gap-2">
          <Link to="/">
            <Compass className="h-4 w-4" />
            Explore GlobeTrotter AI
          </Link>
        </Button>
      </div>
    );
  }

  const stops = trip.stops || [];
  const destinationCount = stops.length;

  return (
    <div className="space-y-8 animate-fade-in pb-20 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Top Banner Navigation & Clone CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
          >
            Public Shared Itinerary
          </Badge>
          <span className="text-xs text-surface-400">Read-Only View</span>
        </div>

        <Button
          onClick={handleCopyTrip}
          disabled={isCloning || cloneMutation.isPending}
          className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold shadow-md hover:shadow-primary-500/20"
        >
          <Copy className="h-4 w-4" />
          {isCloning ? "Copying to Your Trips..." : "Copy Trip to My Account"}
        </Button>
      </div>

      {/* Hero Banner Card */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-3xl bg-surface-900 shadow-elevated">
        <img
          src={
            trip.cover_image_url ||
            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80"
          }
          alt={trip.title}
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-[var(--font-display)] drop-shadow-md">
            {trip.title}
          </h1>

          {trip.description && (
            <p className="text-sm sm:text-base text-white/85 max-w-3xl line-clamp-2">
              {trip.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/90 pt-1">
            <div className="flex items-center gap-1.5 rounded-full bg-black/50 px-3.5 py-1.5 backdrop-blur-md border border-white/10">
              <Calendar className="h-4 w-4 text-accent-400" />
              <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-black/50 px-3.5 py-1.5 backdrop-blur-md border border-white/10">
              <Clock className="h-4 w-4 text-accent-400" />
              <span>{durationDays} Days</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-black/50 px-3.5 py-1.5 backdrop-blur-md border border-white/10">
              <MapPin className="h-4 w-4 text-accent-400" />
              <span>{destinationCount} Destinations</span>
            </div>
            {budget && (
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-950/60 text-emerald-300 px-3.5 py-1.5 backdrop-blur-md border border-emerald-500/30 font-bold">
                <Receipt className="h-4 w-4" />
                <span>Est. Cost: {formatCurrency(budget.total)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Destinations Route Strip */}
      {stops.length > 0 && (
        <div className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-5 shadow-card space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500 flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary-500" />
            Route & Destinations
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            {stops.map((stop, index) => (
              <div key={stop.id} className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-surface-50 dark:bg-surface-800/60 px-3.5 py-2 border border-surface-200/80 dark:border-surface-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-extrabold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold text-surface-900 dark:text-surface-100">
                    {stop.city?.name || "City"}
                  </span>
                  <span className="text-xs text-surface-400">
                    ({stop.city?.country})
                  </span>
                </div>
                {index < stops.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-surface-400 hidden sm:inline-block" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day-by-Day Itinerary Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100 font-[var(--font-display)]">
              Trip Itinerary & Schedule
            </h2>
            <p className="text-xs text-surface-500">
              Curated day-wise schedule with planned activities
            </p>
          </div>
        </div>

        {stops.length === 0 ? (
          <Card className="p-8 text-center text-sm text-surface-400">
            No scheduled stops in this itinerary.
          </Card>
        ) : (
          <div className="space-y-6">
            {stops.map((stop, stopIdx) => {
              const activities = stop.stop_activities || [];
              return (
                <Card
                  key={stop.id}
                  className="overflow-hidden shadow-card border-surface-200 dark:border-surface-800"
                >
                  <CardHeader className="bg-surface-50/70 dark:bg-surface-800/40 border-b border-surface-200/60 dark:border-surface-800 pb-3 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600 text-xs font-black text-white">
                        {stopIdx + 1}
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-surface-900 dark:text-surface-100">
                          {stop.city?.name || "Destination"}
                        </CardTitle>
                        <p className="text-xs text-surface-500">
                          {stop.city?.country} • {activities.length} activities
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5">
                    {activities.length === 0 ? (
                      <p className="text-xs text-surface-400 italic py-2">
                        No activities scheduled for this stop.
                      </p>
                    ) : (
                      <div className="divide-y divide-surface-100 dark:divide-surface-800">
                        {activities.map((sa) => {
                          const act = sa.activity;
                          const title = act?.title || sa.notes || "Activity";
                          const cost = sa.cost || act?.estimated_cost || 0;
                          const category = act?.category || "Activities";

                          return (
                            <div
                              key={sa.id}
                              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-surface-100 dark:bg-surface-800 p-2 text-primary-600 dark:text-primary-400 font-bold shrink-0">
                                  Day {sa.day_number}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-surface-900 dark:text-surface-100">
                                      {title}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] py-0 px-2 text-surface-500"
                                    >
                                      {category}
                                    </Badge>
                                  </div>

                                  {act?.description && (
                                    <p className="text-surface-500 line-clamp-1 max-w-lg">
                                      {act.description}
                                    </p>
                                  )}

                                  {sa.scheduled_time && (
                                    <div className="flex items-center gap-1 text-surface-400 text-[11px]">
                                      <Clock className="h-3 w-3" />
                                      <span>{sa.scheduled_time}</span>
                                      {act?.duration_hours && (
                                        <span>• {act.duration_hours} hrs</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="sm:text-right shrink-0 pl-11 sm:pl-0">
                                <span className="font-extrabold text-sm text-surface-900 dark:text-surface-100">
                                  {cost === 0 ? "Free" : formatCurrency(cost)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Sticky-style CTA Card */}
      <div className="rounded-3xl bg-gradient-to-br from-surface-900 via-surface-950 to-primary-950 p-8 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1.5 max-w-xl">
          <h3 className="text-2xl font-extrabold tracking-tight font-[var(--font-display)]">
            Love this itinerary? Make it your own!
          </h3>
          <p className="text-xs sm:text-sm text-surface-300">
            Copy this complete plan to your GlobeTrotter account to customize dates, adjust budgets with AI, and add your own stops.
          </p>
        </div>

        <Button
          size="lg"
          onClick={handleCopyTrip}
          disabled={isCloning || cloneMutation.isPending}
          className="w-full sm:w-auto shrink-0 gap-2 bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white font-bold px-6 py-6 text-sm shadow-xl"
        >
          <Copy className="h-5 w-5" />
          {isCloning ? "Copying..." : "Copy Trip to My Account"}
        </Button>
      </div>
    </div>
  );
}
