import React from "react";
import type { DayPlan } from "@/features/itinerary/types";

interface CalendarDayStripProps {
  days: DayPlan[];
  selectedDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
}

export const CalendarDayStrip: React.FC<CalendarDayStripProps> = ({
  days,
  selectedDayNumber,
  onSelectDay,
}) => {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar select-none">
      {days.map((day) => {
        const isSelected = day.dayNumber === selectedDayNumber;
        const activityCount = day.activities.length;
        const hasConflicts = day.validationIssues && day.validationIssues.length > 0;

        return (
          <button
            key={day.dayNumber}
            onClick={() => onSelectDay(day.dayNumber)}
            className={`flex flex-col items-center justify-between p-3 rounded-2xl min-w-[90px] h-[105px] border text-left transition-all duration-200 shrink-0 ${
              isSelected
                ? "bg-primary-500 text-white border-primary-600 shadow-md scale-[1.02]"
                : "bg-card hover:bg-surface-50 dark:hover:bg-surface-900 border-surface-200 dark:border-surface-800 text-surface-800 dark:text-surface-200"
            }`}
          >
            {/* Top row: Day label & notice dot */}
            <div className="w-full flex items-center justify-between">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isSelected ? "text-primary-100" : "text-surface-400"
                }`}
              >
                Day {day.dayNumber}
              </span>
              {hasConflicts && (
                <span
                  className={`h-2 w-2 rounded-full ${
                    isSelected ? "bg-amber-300" : "bg-amber-500"
                  }`}
                  title="Schedule Notice"
                />
              )}
            </div>

            {/* Middle: Date Number & Month */}
            <div className="text-center my-0.5">
              <div className="text-base font-extrabold leading-none">
                {day.dateStr ? day.dateStr.split("-")[2] : `#${day.dayNumber}`}
              </div>
              <div
                className={`text-[10px] font-medium mt-0.5 truncate max-w-[70px] ${
                  isSelected ? "text-primary-100" : "text-surface-500"
                }`}
              >
                {day.formattedDate ? day.formattedDate.split(",")[0] : `Day ${day.dayNumber}`}
              </div>
            </div>

            {/* Bottom: Activity count or City pill */}
            <div
              className={`w-full text-center text-[10px] py-0.5 rounded-md font-medium truncate ${
                isSelected
                  ? "bg-primary-600/60 text-white"
                  : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400"
              }`}
            >
              {day.city ? (
                <span className="truncate block px-1">{day.city.name}</span>
              ) : (
                <span>{activityCount} {activityCount === 1 ? "act" : "acts"}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
