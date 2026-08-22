import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  LogOut,
  User,
  Settings,
  Globe,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MobileSidebarContent } from "@/components/layout/Sidebar";
import { NotificationDropdown } from "./NotificationDropdown";
import { CurrencySwitcher } from "./CurrencySwitcher";

interface NavbarProps {
  sidebarCollapsed: boolean;
}

export function Navbar({ sidebarCollapsed }: NavbarProps) {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.email || "Traveler";

  return (
    <>
      <header
        className="fixed top-0 right-0 z-30 flex h-16 items-center border-b border-surface-200 dark:border-surface-800 bg-white/80 dark:bg-surface-950/80 backdrop-blur-md transition-all duration-300"
        style={{
          left: sidebarCollapsed ? "72px" : "260px",
        }}
      >
        <div className="flex w-full items-center justify-between px-4 lg:px-6">
          {/* Left: Mobile menu button and branding indicator */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <span className="hidden sm:inline-block text-xs font-semibold text-surface-500">
              GlobeTrotter AI Workspace
            </span>
          </div>

          {/* Right side actions: Currency Switcher + Notifications + User profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Global Currency Switcher */}
            <CurrencySwitcher />

            {/* Notifications Center */}
            <NotificationDropdown />

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 h-9 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-900">
                  <Avatar className="h-7 w-7 border border-surface-200 dark:border-surface-700">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-xs font-bold bg-primary-50 text-primary-700">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-xs font-semibold text-surface-700 dark:text-surface-200 md:inline-block max-w-[120px] truncate">
                    {displayName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl border-surface-200 dark:border-surface-800 shadow-xl">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-surface-900 dark:text-surface-100">{displayName}</span>
                    <span className="text-[11px] text-surface-400 truncate">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="text-xs font-medium cursor-pointer">
                      <User className="mr-2 h-3.5 w-3.5 text-surface-500" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="text-xs font-medium cursor-pointer">
                      <Settings className="mr-2 h-3.5 w-3.5 text-surface-500" />
                      Settings & Preferences
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-xs font-semibold text-danger-600 cursor-pointer">
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-4">
          <div className="flex items-center gap-3 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-surface-900">GlobeTrotter</span>
          </div>
          <MobileSidebarContent onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
