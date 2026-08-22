import { Link } from "react-router-dom";
import { PlusCircle, ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PlanNewTripCTA() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent-200 bg-gradient-to-r from-accent-50 to-amber-100/60 p-6 shadow-card transition-all hover:shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-500 text-white shadow-md">
            <Compass className="h-6 w-6 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-surface-900">Plan a New Adventure</h3>
            <p className="mt-0.5 text-sm text-surface-600">
              Set destinations, dates, and target budget to create your next custom itinerary.
            </p>
          </div>
        </div>

        <Button variant="accent" size="lg" asChild className="gap-2 shrink-0 shadow-md">
          <Link to="/trips/new">
            <PlusCircle className="h-5 w-5" />
            Plan New Trip
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
