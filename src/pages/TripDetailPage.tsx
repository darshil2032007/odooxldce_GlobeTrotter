import { useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Share2,
  Sparkles,
} from "lucide-react";
import { useTrip } from "@/hooks/useTrips";
import { useTripDetails } from "@/features/itinerary/hooks/useItinerary";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDateRange, getTripDuration } from "@/lib/utils";
import { ItineraryBuilder } from "@/features/itinerary";
import { BudgetOverview } from "@/features/budget";
import { TripSharingTab, ShareTripDialog } from "@/features/sharing";
import { AITravelCopilotDrawer } from "@/components/ai/AITravelCopilotDrawer";
import { AIOptimizeTripModal } from "@/components/ai/AIOptimizeTripModal";

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);

  const { data: trip, isLoading, isError, refetch } = useTrip(id || "");
  const { data: tripDetails } = useTripDetails(id || "");

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !trip) {
    return (
      <ErrorState
        title="Trip not found"
        message="The requested trip details could not be loaded."
        onRetry={refetch}
      />
    );
  }

  const durationDays = getTripDuration(trip.startDate, trip.endDate);
  const budgetPercentage =
    trip.budgetTarget > 0
      ? Math.min(Math.round((trip.budgetSpent / trip.budgetTarget) * 100), 100)
      : 0;

  const handleTabChange = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", val);
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top back button & breadcrumbs */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-1 text-surface-500">
          <Link to="/trips">
            <ArrowLeft className="h-4 w-4" />
            Back to My Trips
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {tripDetails && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-primary-500/30 text-primary-600 dark:text-primary-400 hover:bg-primary-500/10 font-semibold"
              onClick={() => setIsOptimizeModalOpen(true)}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              ✨ Optimize Trip
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsShareDialogOpen(true)}
          >
            <Share2 className="h-3.5 w-3.5" />
            Share Trip
          </Button>
          <Badge variant="default" className="capitalize">
            {trip.status}
          </Badge>
        </div>
      </div>

      {/* Hero Banner Header */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-3xl bg-surface-900 shadow-elevated">
        <img
          src={
            trip.coverImage ||
            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
          }
          alt={trip.name}
          className="h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight drop-shadow-md font-[var(--font-display)]">
            {trip.name}
          </h1>
          {trip.description && (
            <p className="text-sm sm:text-base text-white/80 max-w-2xl line-clamp-2">
              {trip.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/90 pt-2">
            <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
              <Calendar className="h-4 w-4 text-accent-400" />
              <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
              <Clock className="h-4 w-4 text-accent-400" />
              <span>{durationDays} Days</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
              <MapPin className="h-4 w-4 text-accent-400" />
              <span>{trip.destinationCount} Destinations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Layout */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full justify-start border-b border-surface-200 bg-transparent p-0 gap-6 rounded-none overflow-x-auto">
          <TabsTrigger
            value="overview"
            className="border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 data-[state=active]:bg-transparent rounded-none px-1 py-3 font-semibold"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="itinerary"
            className="border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 data-[state=active]:bg-transparent rounded-none px-1 py-3 font-semibold"
          >
            Itinerary & Schedule
          </TabsTrigger>
          <TabsTrigger
            value="budget"
            className="border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 data-[state=active]:bg-transparent rounded-none px-1 py-3 font-semibold"
          >
            Budget & Expenses
          </TabsTrigger>
          <TabsTrigger
            value="sharing"
            className="border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 data-[state=active]:bg-transparent rounded-none px-1 py-3 font-semibold"
          >
            Sharing & Collaborators
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Quick Metrics */}
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-surface-500 font-medium">
                  Budget Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-surface-900">
                    {formatCurrency(trip.budgetSpent)}
                  </span>
                  <span className="text-xs text-surface-500 font-medium">
                    Target: {formatCurrency(trip.budgetTarget)}
                  </span>
                </div>
                <Progress value={budgetPercentage} />
                <p className="text-xs text-surface-500">
                  {budgetPercentage}% of target budget used
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-surface-500 font-medium">
                  Stops & Destinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-surface-900">
                  {trip.destinationCount} Cities
                </div>
                <p className="text-xs text-surface-500 mt-1">
                  Multi-city itinerary planned
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-surface-500 font-medium">
                  Trip Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-surface-900">
                  {durationDays} Days
                </div>
                <p className="text-xs text-surface-500 mt-1">
                  From {new Date(trip.startDate).toLocaleDateString()} to{" "}
                  {new Date(trip.endDate).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Description Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">About This Trip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-surface-600 leading-relaxed">
                {trip.description || "No description provided for this trip yet."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Itinerary Tab */}
        <TabsContent value="itinerary" className="mt-6">
          <ItineraryBuilder tripId={id || trip.id} />
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="mt-6">
          <BudgetOverview tripId={id || trip.id} />
        </TabsContent>

        {/* Sharing Tab */}
        <TabsContent value="sharing" className="mt-6">
          {tripDetails ? (
            <TripSharingTab trip={tripDetails} />
          ) : (
            <TripSharingTab
              trip={
                {
                  id: trip.id,
                  user_id: "",
                  title: trip.name,
                  description: trip.description || null,
                  start_date: trip.startDate,
                  end_date: trip.endDate,
                  target_budget: trip.budgetTarget,
                  cover_image_url: trip.coverImage || null,
                  is_public: false,
                  share_slug: null,
                  created_at: trip.createdAt,
                  updated_at: trip.createdAt,
                  stops: [],
                } as any
              }
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Floating Copilot Launcher Button */}
      {tripDetails && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setIsCopilotOpen(true)}
            className="rounded-full h-12 px-5 gap-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all ring-2 ring-white/20"
          >
            <div className="rounded-full bg-amber-400/20 p-1 text-amber-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>Ask Copilot</span>
          </Button>
        </div>
      )}

      {/* Share Trip Dialog */}
      {tripDetails && (
        <ShareTripDialog
          trip={tripDetails}
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
        />
      )}

      {/* AI Copilot Drawer */}
      {tripDetails && (
        <AITravelCopilotDrawer
          trip={tripDetails}
          open={isCopilotOpen}
          onOpenChange={setIsCopilotOpen}
        />
      )}

      {/* AI Optimize Trip Modal */}
      {tripDetails && (
        <AIOptimizeTripModal
          trip={tripDetails}
          open={isOptimizeModalOpen}
          onOpenChange={setIsOptimizeModalOpen}
        />
      )}
    </div>
  );
}
