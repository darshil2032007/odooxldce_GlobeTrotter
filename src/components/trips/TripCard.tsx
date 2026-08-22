import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Clock,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDateRange, getTripDuration } from "@/lib/utils";
import type { TripCardData } from "@/types";

interface TripCardProps {
  trip: TripCardData;
  onEdit?: (trip: TripCardData) => void;
  onDelete?: (trip: TripCardData) => void;
  onDuplicate?: (trip: TripCardData) => void;
}

export function TripCard({ trip, onEdit, onDelete, onDuplicate }: TripCardProps) {
  const durationDays = getTripDuration(trip.startDate, trip.endDate);
  const budgetPercentage =
    trip.budgetTarget > 0
      ? Math.min(Math.round((trip.budgetSpent / trip.budgetTarget) * 100), 100)
      : 0;

  const statusVariant = {
    upcoming: "default",
    ongoing: "warning",
    completed: "success",
    draft: "secondary",
  } as const;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated flex flex-col justify-between">
      <div>
        {/* Cover Image */}
        <div className="relative h-44 w-full overflow-hidden bg-surface-100">
          <img
            src={
              trip.coverImage ||
              "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
            }
            alt={trip.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Top Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <Badge variant={statusVariant[trip.status]} className="capitalize shadow-sm">
              {trip.status}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link to={`/trips/${trip.id}`}>
                    <Eye className="mr-2 h-4 w-4 text-surface-500" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(trip)}>
                  <Edit2 className="mr-2 h-4 w-4 text-surface-500" />
                  Edit Trip
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(trip)}>
                  <Copy className="mr-2 h-4 w-4 text-surface-500" />
                  Duplicate (Mock)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(trip)}
                  className="text-danger-600 focus:text-danger-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Trip
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title on Image */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="text-lg font-bold leading-tight drop-shadow-md line-clamp-1">
              {trip.name}
            </h3>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-3">
          {trip.description && (
            <p className="text-xs text-surface-500 line-clamp-2">{trip.description}</p>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs text-surface-600 pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-surface-400 shrink-0" />
              <span className="truncate">{formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>

            <div className="flex items-center gap-1.5 justify-end">
              <Clock className="h-3.5 w-3.5 text-surface-400 shrink-0" />
              <span>{durationDays} days</span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-surface-400 shrink-0" />
              <span>{trip.destinationCount} stops</span>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="space-y-1.5 pt-2 border-t border-surface-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-surface-500">Budget Progress</span>
              <span className="font-semibold text-surface-800">
                {formatCurrency(trip.budgetSpent)} / {formatCurrency(trip.budgetTarget)}
              </span>
            </div>
            <Progress
              value={budgetPercentage}
              indicatorClassName={
                budgetPercentage > 90
                  ? "bg-danger-500"
                  : budgetPercentage > 75
                  ? "bg-accent-500"
                  : "bg-emerald-500"
              }
            />
          </div>
        </CardContent>
      </div>

      {/* Footer Actions */}
      <div className="px-4 pb-4 pt-0 flex items-center justify-between gap-2 border-t border-surface-50 pt-3">
        <Button variant="outline" size="sm" asChild className="w-full text-xs">
          <Link to={`/trips/${trip.id}`}>
            <Eye className="mr-1.5 h-3.5 w-3.5" /> View Details
          </Link>
        </Button>
      </div>
    </Card>
  );
}
