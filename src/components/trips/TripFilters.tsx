import { Search, Filter, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface TripFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
}

export function TripFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
}: TripFiltersProps) {
  const statuses: { label: string; value: string }[] = [
    { label: "All Trips", value: "all" },
    { label: "Upcoming", value: "upcoming" },
    { label: "Ongoing", value: "ongoing" },
    { label: "Completed", value: "completed" },
    { label: "Drafts", value: "draft" },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
        <Input
          placeholder="Search by trip name or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Status Filter Buttons / Tabs */}
        <div className="hidden md:flex items-center bg-surface-100 p-1 rounded-xl gap-1">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => onStatusFilterChange(status.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                statusFilter === status.value
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-surface-600 hover:text-surface-900"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* Mobile Filter Dropdown */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statuses.map((status) => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={() => onStatusFilterChange(status.value)}
                  className={statusFilter === status.value ? "font-bold text-primary-600" : ""}
                >
                  {status.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SortAsc className="h-4 w-4" />
              <span className="hidden sm:inline">Sort</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onSortByChange("date-asc")}
              className={sortBy === "date-asc" ? "font-bold text-primary-600" : ""}
            >
              Start Date (Soonest)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortByChange("date-desc")}
              className={sortBy === "date-desc" ? "font-bold text-primary-600" : ""}
            >
              Start Date (Latest)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortByChange("budget-desc")}
              className={sortBy === "budget-desc" ? "font-bold text-primary-600" : ""}
            >
              Budget (Highest)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortByChange("name-asc")}
              className={sortBy === "name-asc" ? "font-bold text-primary-600" : ""}
            >
              Trip Name (A-Z)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
