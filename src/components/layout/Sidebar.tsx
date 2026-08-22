import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  PlusCircle,
  Building2,
  Sparkles,
  Settings,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Trips", href: "/trips", icon: Map },
  { label: "Create Trip", href: "/trips/new", icon: PlusCircle },
  { label: "Explore Cities", href: "/cities", icon: Building2 },
  { label: "Things to Do", href: "/activities", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function MobileSidebarContent({
  onClose,
  onNavigate,
}: {
  onClose?: () => void;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const handleItemClick = () => {
    onClose?.();
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-surface-200 px-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-primary">
          <Globe className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-surface-900 font-[var(--font-display)]">
          GlobeTrotter
        </span>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/dashboard" && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={handleItemClick}
              className={cn(
                "flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-50 text-primary-600 font-semibold shadow-sm"
                  : "text-surface-600 hover:bg-surface-50 hover:text-surface-900"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary-500")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-surface-200 bg-white transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-surface-200 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-primary">
          <Globe className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-surface-900 font-[var(--font-display)]">
            GlobeTrotter
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/dashboard" && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-50 text-primary-600 shadow-sm font-semibold"
                  : "text-surface-600 hover:bg-surface-50 hover:text-surface-900",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary-500")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-surface-200 p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            "w-full text-surface-500 hover:text-surface-900",
            collapsed ? "px-0 justify-center" : "justify-between"
          )}
        >
          {!collapsed && <span className="text-xs">Collapse Sidebar</span>}
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
