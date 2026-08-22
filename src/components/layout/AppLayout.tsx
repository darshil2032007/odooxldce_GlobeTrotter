import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Sidebar — hidden on mobile, visible on lg+ */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Navbar */}
      <Navbar sidebarCollapsed={sidebarCollapsed} />

      {/* Main content */}
      <main
        className={cn(
          "pt-16 transition-all duration-300",
          "lg:ml-[260px]",
          sidebarCollapsed && "lg:ml-[72px]"
        )}
      >
        <div className="mx-auto max-w-7xl p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
