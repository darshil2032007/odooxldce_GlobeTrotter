import React from "react";
import { Clock, Plus, Check } from "lucide-react";
import type { Activity } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { getCategoryColor } from "../utils/categoryColors";

interface ActivityCardProps {
  activity: Activity;
  onSelect?: (activity: Activity) => void;
  isSelected?: boolean;
  actionLabel?: string;
  disabled?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onSelect,
  isSelected = false,
  actionLabel = "Add Activity",
  disabled = false,
}) => {
  return (
    <Card
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
        isSelected
          ? "ring-2 ring-primary-500 border-primary-500 bg-primary-50/10"
          : "border-surface-200 dark:border-surface-800 bg-card"
      }`}
    >
      <div>
        {/* Activity Thumbnail Image */}
        <div className="relative h-36 w-full overflow-hidden bg-surface-100 dark:bg-surface-800">
          <img
            src={
              activity.image_url ||
              "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80"
            }
            alt={activity.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Category Badge */}
          <div className="absolute top-2.5 left-2.5">
            <Badge
              variant="outline"
              className={`text-[11px] font-medium shadow-sm backdrop-blur-md ${getCategoryColor(
                activity.category
              )}`}
            >
              {activity.category}
            </Badge>
          </div>

          {/* Duration Pill */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/65 backdrop-blur-md px-2 py-0.5 text-[11px] font-medium text-white shadow-sm">
            <Clock className="h-3 w-3 text-primary-300" />
            <span>{activity.duration_hours}h</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm text-surface-900 dark:text-surface-100 line-clamp-1 group-hover:text-primary-600 transition-colors">
              {activity.title}
            </h4>
            <span className="font-bold text-xs text-primary-600 dark:text-primary-400 shrink-0">
              {activity.estimated_cost === 0
                ? "Free"
                : formatCurrency(activity.estimated_cost)}
            </span>
          </div>

          {activity.description && (
            <p className="text-xs text-surface-500 dark:text-surface-400 line-clamp-2 leading-relaxed">
              {activity.description}
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      {onSelect && (
        <div className="p-4 pt-0">
          <Button
            onClick={() => onSelect(activity)}
            disabled={disabled}
            size="sm"
            variant={isSelected ? "secondary" : "default"}
            className="w-full gap-1.5 text-xs font-medium"
          >
            {isSelected ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                Scheduled
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                {actionLabel}
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
};
