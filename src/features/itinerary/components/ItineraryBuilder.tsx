import React, { useState, useMemo } from "react";
import {
  useTripDetails,
  useCreateStop,
  useUpdateStop,
  useDeleteStop,
  useReorderStops,
  useCreateStopActivity,
  useUpdateStopActivity,
  useDeleteStopActivity,
  useToggleActivityCompleted,
} from "../hooks/useItinerary";
import { deriveItineraryDays } from "../utils/dayCalculations";
import { validateItinerarySchedule } from "../utils/scheduleValidation";
import { TripHeaderSummary } from "./TripHeaderSummary";
import { ScheduleValidationAlert } from "./ScheduleValidationAlert";
import { DayListView } from "./DayListView";
import { StopsManager } from "./StopsManager";
import { ActivitySearchDialog } from "@/features/activities/components/ActivitySearchDialog";
import { CitySearchDialog } from "@/features/cities/components/CitySearchDialog";
import { ItineraryCalendarView } from "@/features/calendar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { Calendar, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import type { City, TripWithDetails } from "@/types/database";

interface ItineraryBuilderProps {
  tripId: string;
  trip?: TripWithDetails;
}

export const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({
  tripId,
  trip: initialTrip,
}) => {
  const {
    data: tripData,
    isLoading,
    isError,
    refetch,
  } = useTripDetails(tripId);

  const trip = tripData || initialTrip;

  // Mutations
  const createStopMutation = useCreateStop(tripId);
  const updateStopMutation = useUpdateStop(tripId);
  const deleteStopMutation = useDeleteStop(tripId);
  const reorderStopsMutation = useReorderStops(tripId);
  const createActivityMutation = useCreateStopActivity(tripId);
  const updateActivityMutation = useUpdateStopActivity(tripId);
  const deleteActivityMutation = useDeleteStopActivity(tripId);
  const toggleActivityMutation = useToggleActivityCompleted(tripId);

  // Modals state
  const [isCitySearchOpen, setIsCitySearchOpen] = useState(false);
  const [isActivitySearchOpen, setIsActivitySearchOpen] = useState(false);
  const [selectedTargetStopId, setSelectedTargetStopId] = useState<string | undefined>();
  const [selectedTargetDayNumber, setSelectedTargetDayNumber] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("day-by-day");

  // Derive days from trip & stops
  const derivedDays = useMemo(() => {
    if (!trip) return [];
    return deriveItineraryDays(trip.start_date, trip.end_date, trip.stops || []);
  }, [trip]);

  // Validation
  const { allIssues, daysWithIssues } = useMemo(() => {
    if (!trip) return { allIssues: [], daysWithIssues: new Map(), stopIssues: new Map() };
    return validateItinerarySchedule(trip, trip.stops || [], derivedDays);
  }, [trip, derivedDays]);

  // Inject validation issues into derived days
  const enrichedDays = useMemo(() => {
    return derivedDays.map((d) => ({
      ...d,
      validationIssues: daysWithIssues.get(d.dayNumber) || [],
    }));
  }, [derivedDays, daysWithIssues]);

  // Total metrics
  const { totalActivities, completedActivities, totalCost } = useMemo(() => {
    let totalAct = 0;
    let completedAct = 0;
    let costSum = 0;

    (trip?.stops || []).forEach((s) => {
      (s.stop_activities || []).forEach((sa) => {
        totalAct += 1;
        if (sa.is_completed) completedAct += 1;
        costSum += sa.cost || 0;
      });
    });

    return {
      totalActivities: totalAct,
      completedActivities: completedAct,
      totalCost: costSum,
    };
  }, [trip]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !trip) {
    return (
      <ErrorState
        title="Could not load itinerary"
        message="Unable to fetch trip stops and activities. Please try again."
        onRetry={refetch}
      />
    );
  }

  // Handlers
  const handleAddStop = async (city: City, arrivalDate?: string, departureDate?: string) => {
    try {
      await createStopMutation.mutateAsync({
        trip_id: trip.id,
        city_id: city.id,
        arrival_date: arrivalDate || null,
        departure_date: departureDate || null,
      });
      toast.success(`Added ${city.name} to trip itinerary!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add stop");
    }
  };

  const handleUpdateStopDates = async (
    stopId: string,
    arrivalDate?: string | null,
    departureDate?: string | null
  ) => {
    try {
      await updateStopMutation.mutateAsync({
        id: stopId,
        updates: {
          arrival_date: arrivalDate,
          departure_date: departureDate,
        },
      });
      toast.success("Updated stop dates");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update stop");
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    try {
      await deleteStopMutation.mutateAsync(stopId);
      toast.success("Destination stop removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete stop");
    }
  };

  const handleReorderStops = async (newOrder: { id: string; stop_order: number }[]) => {
    try {
      await reorderStopsMutation.mutateAsync(newOrder);
      toast.success("Updated stop sequence");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reorder stops");
    }
  };

  const handleOpenActivitySearchForDay = (dayNumber: number, stopId?: string) => {
    if (!trip.stops || trip.stops.length === 0) {
      toast.info("Please add a destination city stop before scheduling activities.");
      setIsCitySearchOpen(true);
      return;
    }
    const targetStop = stopId ? trip.stops.find((s) => s.id === stopId) : trip.stops[0];
    setSelectedTargetDayNumber(dayNumber);
    setSelectedTargetStopId(targetStop?.id || trip.stops[0]?.id);
    setIsActivitySearchOpen(true);
  };

  const handleOpenActivitySearchForStop = (stopId: string) => {
    setSelectedTargetStopId(stopId);
    setSelectedTargetDayNumber(1);
    setIsActivitySearchOpen(true);
  };

  const handleScheduleActivity = async (data: {
    stopId: string;
    activityId?: string | null;
    dayNumber: number;
    scheduledTime?: string;
    cost: number;
    notes?: string;
  }) => {
    const targetStopId = data.stopId || selectedTargetStopId || trip.stops[0]?.id;
    if (!targetStopId) {
      toast.error("Please add a destination city stop first.");
      setIsCitySearchOpen(true);
      return;
    }
    try {
      await createActivityMutation.mutateAsync({
        stop_id: targetStopId,
        activity_id: data.activityId || null,
        day_number: Number(data.dayNumber) || 1,
        scheduled_time: data.scheduledTime || null,
        cost: Number(data.cost) || 0,
        notes: data.notes || null,
      });
      toast.success("Activity scheduled!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule activity");
    }
  };

  const handleToggleActivity = async (id: string, isCompleted: boolean) => {
    await toggleActivityMutation.mutateAsync({ id, isCompleted });
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      await deleteActivityMutation.mutateAsync(id);
      toast.success("Activity removed from schedule");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove activity");
    }
  };

  const handleUpdateActivity = async (
    id: string,
    updates: {
      scheduled_time?: string | null;
      cost?: number;
      notes?: string | null;
      day_number?: number;
    }
  ) => {
    await updateActivityMutation.mutateAsync({ id, updates });
  };

  const handleReorderActivitiesInDay = async (
    _dayNumber: number,
    reorderedIds: string[]
  ) => {
    const defaultTimes = ["09:00", "11:30", "14:00", "16:30", "19:00", "21:00"];
    for (let i = 0; i < reorderedIds.length; i++) {
      const id = reorderedIds[i];
      const newTime = defaultTimes[i % defaultTimes.length];
      await updateActivityMutation.mutateAsync({
        id,
        updates: { scheduled_time: newTime },
      });
    }
  };

  const stopsCount = trip.stops ? trip.stops.length : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* 1. Trip Header Summary */}
      <TripHeaderSummary
        trip={trip}
        totalActivities={totalActivities}
        completedActivities={completedActivities}
        totalCost={totalCost}
        onAddStop={() => setIsCitySearchOpen(true)}
        onAddActivity={() => {
          if (!trip.stops || trip.stops.length === 0) {
            toast.info("Please add a destination city stop first.");
            setIsCitySearchOpen(true);
            return;
          }
          setSelectedTargetStopId(trip.stops[0]?.id);
          setIsActivitySearchOpen(true);
        }}
      />

      {/* 2. Real-time Schedule Validation Alert */}
      <ScheduleValidationAlert issues={allIssues} />

      {/* 3. Sub-View Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b border-surface-200 dark:border-surface-800 pb-2">
          <TabsList className="bg-surface-100 dark:bg-surface-900 p-1 rounded-xl">
            <TabsTrigger
              value="day-by-day"
              className="text-xs font-medium gap-1.5 px-3 py-1.5 rounded-lg"
            >
              <Calendar className="h-3.5 w-3.5" />
              Day-by-Day View
            </TabsTrigger>
            <TabsTrigger
              value="stops"
              className="text-xs font-medium gap-1.5 px-3 py-1.5 rounded-lg"
            >
              <MapPin className="h-3.5 w-3.5" />
              City Stops ({stopsCount})
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="text-xs font-medium gap-1.5 px-3 py-1.5 rounded-lg"
            >
              <Clock className="h-3.5 w-3.5" />
              Timeline & Calendar
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Day by Day Chronological List */}
        <TabsContent value="day-by-day" className="mt-4">
          <DayListView
            days={enrichedDays}
            onAddActivityToDay={handleOpenActivitySearchForDay}
            onToggleComplete={handleToggleActivity}
            onDeleteActivity={handleDeleteActivity}
            onUpdateActivity={handleUpdateActivity}
            onReorderActivitiesInDay={handleReorderActivitiesInDay}
          />
        </TabsContent>

        {/* Tab 2: City Stops Management */}
        <TabsContent value="stops" className="mt-4">
          <StopsManager
            tripId={trip.id}
            stops={trip.stops || []}
            tripStartDate={trip.start_date}
            tripEndDate={trip.end_date}
            onAddStop={handleAddStop}
            onDeleteStop={handleDeleteStop}
            onReorderStops={handleReorderStops}
            onUpdateStopDates={handleUpdateStopDates}
            onAddActivityToStop={handleOpenActivitySearchForStop}
          />
        </TabsContent>

        {/* Tab 3: Timeline & Calendar */}
        <TabsContent value="timeline" className="mt-4">
          <ItineraryCalendarView
            days={enrichedDays}
            onAddActivityToDay={handleOpenActivitySearchForDay}
            onToggleComplete={handleToggleActivity}
            onDeleteActivity={handleDeleteActivity}
            onUpdateActivity={handleUpdateActivity}
          />
        </TabsContent>
      </Tabs>

      {/* Global City Search Dialog */}
      <CitySearchDialog
        open={isCitySearchOpen}
        onOpenChange={setIsCitySearchOpen}
        onAddStop={handleAddStop}
        tripStartDate={trip.start_date}
        tripEndDate={trip.end_date}
        existingCityIds={(trip.stops || []).map((s) => s.city_id)}
      />

      {/* Global Activity Search Dialog */}
      <ActivitySearchDialog
        open={isActivitySearchOpen}
        onOpenChange={setIsActivitySearchOpen}
        stops={trip.stops || []}
        defaultStopId={selectedTargetStopId}
        defaultDayNumber={selectedTargetDayNumber}
        totalTripDays={derivedDays.length || 7}
        onScheduleActivity={handleScheduleActivity}
      />
    </div>
  );
};
