import React, { useState } from "react";
import { AlertTriangle, AlertCircle, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import type { ItineraryValidationIssue } from "../types";

interface ScheduleValidationAlertProps {
  issues: ItineraryValidationIssue[];
}

export const ScheduleValidationAlert: React.FC<ScheduleValidationAlertProps> = ({
  issues,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (issues.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        <span className="font-medium">
          Schedule Validated: All activities and destination stops are conflict-free!
        </span>
      </div>
    );
  }

  const hasErrors = issues.some((i) => i.severity === "error");

  return (
    <div
      className={`rounded-xl border p-3.5 transition-all text-xs ${
        hasErrors
          ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200"
          : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold">
          {hasErrors ? (
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          )}
          <span>
            {issues.length} Schedule {issues.length === 1 ? "Notice" : "Notices"} Detected:
          </span>
          <span className="font-normal opacity-90 hidden sm:inline">
            {issues[0].message}
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 font-medium hover:underline shrink-0 text-xs"
        >
          <span>{isExpanded ? "Hide Details" : "View All"}</span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {isExpanded && (
        <ul className="mt-3 pt-2.5 border-t border-current/15 space-y-1.5 list-disc list-inside">
          {issues.map((issue, idx) => (
            <li key={idx} className="leading-relaxed">
              <span className="font-medium">
                {issue.type === "overlap"
                  ? "[Timing Conflict]"
                  : issue.type === "out_of_dates"
                  ? "[Out of Bounds]"
                  : issue.type === "city_mismatch"
                  ? "[City Location]"
                  : "[Stop Dates]"}
              </span>{" "}
              {issue.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
