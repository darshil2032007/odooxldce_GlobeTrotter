import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Sparkles,
  AlertTriangle,
  Calendar,
  Check,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AppNotification {
  id: string;
  type: "budget" | "ai" | "schedule" | "general";
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    type: "budget",
    title: "Budget Deficit Detected",
    description: "Your trip itinerary is currently ₹5,500 over your target budget limit.",
    timeAgo: "10m ago",
    read: false,
    link: "/trips",
  },
  {
    id: "notif-2",
    type: "ai",
    title: "AI Optimization Ready",
    description: "Gemini AI identified 2 cost-saving activity replacements.",
    timeAgo: "1h ago",
    read: false,
    link: "/trips",
  },
  {
    id: "notif-3",
    type: "schedule",
    title: "Upcoming Trip Reminder",
    description: "Goa Coastal Expedition starts in 12 days. Check your packing list with Copilot.",
    timeAgo: "1d ago",
    read: true,
    link: "/trips",
  },
];

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "budget":
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      case "ai":
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      case "schedule":
        return <Calendar className="h-4 w-4 text-primary-500" />;
      default:
        return <Bell className="h-4 w-4 text-surface-400" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl">
          <Bell className="h-4 w-4 text-surface-600 dark:text-surface-300" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 shadow-xl rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-3.5 bg-surface-50 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-surface-900 dark:text-surface-100">
              Notifications
            </span>
            {unreadCount > 0 && (
              <Badge variant="default" className="text-[10px] py-0 px-1.5 h-4 bg-primary-600 text-white">
                {unreadCount} new
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-surface-500 hover:text-primary-600 transition-colors px-1.5 py-0.5 rounded hover:bg-surface-200 dark:hover:bg-surface-800"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-surface-400 hover:text-danger-600 transition-colors p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-800"
                title="Clear all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-800/80">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-xs text-surface-400 space-y-1">
              <Check className="h-6 w-6 text-emerald-500 mx-auto" />
              <p className="font-semibold text-surface-700 dark:text-surface-300">You're all caught up!</p>
              <p className="text-[11px]">No new notifications at this time.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => toggleRead(notif.id)}
                className={`p-3 text-xs flex gap-3 items-start transition-colors cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-900 ${
                  !notif.read
                    ? "bg-primary-500/5 dark:bg-primary-500/10"
                    : "opacity-80"
                }`}
              >
                <div className="mt-0.5 rounded-lg p-1.5 bg-surface-100 dark:bg-surface-800 shrink-0">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 space-y-0.5 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`font-semibold truncate ${!notif.read ? "text-surface-900 dark:text-surface-100" : "text-surface-600 dark:text-surface-400"}`}>
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-surface-400 shrink-0">
                      {notif.timeAgo}
                    </span>
                  </div>

                  <p className="text-[11px] text-surface-500 dark:text-surface-400 leading-snug line-clamp-2">
                    {notif.description}
                  </p>

                  {notif.link && (
                    <Link
                      to={notif.link}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary-600 hover:text-primary-700 pt-1"
                    >
                      View details
                      <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
