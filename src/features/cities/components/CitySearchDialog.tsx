import React, { useState, useMemo } from "react";
import type { City, CityFilters } from "@/types/database";
import { useCities } from "../hooks/useCities";
import { CityFiltersBar } from "./CityFiltersBar";
import { CityGrid } from "./CityGrid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, MapPin, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CitySearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStop: (city: City, arrivalDate?: string, departureDate?: string) => Promise<void> | void;
  tripStartDate?: string;
  tripEndDate?: string;
  existingCityIds?: string[];
}

export const CitySearchDialog: React.FC<CitySearchDialogProps> = ({
  open,
  onOpenChange,
  onAddStop,
  tripStartDate,
  tripEndDate,
  existingCityIds = [],
}) => {
  const [filters, setFilters] = useState<CityFilters>({
    searchQuery: "",
    sortBy: "popularity-desc",
  });

  const { data: cities = [], isLoading, isError, refetch } = useCities(filters);

  // Selected city pending date confirmation
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [arrivalDate, setArrivalDate] = useState<string>(tripStartDate || "");
  const [departureDate, setDepartureDate] = useState<string>(tripEndDate || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract unique countries & regions for the filter bar
  const { countries, regions } = useMemo(() => {
    const cSet = new Set<string>();
    const rSet = new Set<string>();
    cities.forEach((c) => {
      if (c.country) cSet.add(c.country);
      if (c.region) rSet.add(c.region);
    });
    return {
      countries: Array.from(cSet).sort(),
      regions: Array.from(rSet).sort(),
    };
  }, [cities]);

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    // Set default stop dates inside trip boundaries if provided
    if (!arrivalDate && tripStartDate) setArrivalDate(tripStartDate);
    if (!departureDate && tripEndDate) setDepartureDate(tripEndDate);
  };

  const handleConfirmAdd = async () => {
    if (!selectedCity) return;
    try {
      setIsSubmitting(true);
      await onAddStop(
        selectedCity,
        arrivalDate ? arrivalDate : undefined,
        departureDate ? departureDate : undefined
      );
      setSelectedCity(null);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Add Destination Stop</DialogTitle>
              <DialogDescription className="text-xs text-surface-500">
                Explore and select cities to add to your multi-city journey.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Selected City Confirmation Panel (if city picked) */}
        {selectedCity ? (
          <div className="p-4 bg-primary-50/50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 rounded-xl space-y-4 animate-fade-in my-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">
                  Selected Destination
                </span>
                <h4 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  {selectedCity.name}, {selectedCity.country}
                </h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCity(null)}
                className="text-xs text-surface-500"
              >
                Change City
              </Button>
            </div>

            {/* Date selection for the stop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="stop-arrival" className="text-xs flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5 text-primary-500" />
                  Arrival Date (Optional)
                </Label>
                <Input
                  id="stop-arrival"
                  type="date"
                  value={arrivalDate}
                  min={tripStartDate}
                  max={tripEndDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stop-departure" className="text-xs flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5 text-primary-500" />
                  Departure Date (Optional)
                </Label>
                <Input
                  id="stop-departure"
                  type="date"
                  value={departureDate}
                  min={arrivalDate || tripStartDate}
                  max={tripEndDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="bg-background text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCity(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmAdd}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                <Check className="h-4 w-4" />
                {isSubmitting ? "Adding Stop..." : "Confirm & Add Stop"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <CityFiltersBar
              filters={filters}
              onFilterChange={setFilters}
              availableCountries={countries}
              availableRegions={regions}
            />

            <CityGrid
              cities={cities}
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
              onSelectCity={handleSelectCity}
              selectedCityIds={existingCityIds}
              actionLabel="Select Destination"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
