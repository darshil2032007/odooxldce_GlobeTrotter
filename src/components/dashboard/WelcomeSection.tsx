import { useAuth } from "@/hooks/useAuth";
import { Compass, MapPin } from "lucide-react";

export function WelcomeSection() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || "Traveler";

  return (
    <div className="relative overflow-hidden rounded-3xl gradient-hero p-6 text-white shadow-elevated lg:p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Compass className="h-3.5 w-3.5 text-accent-300 animate-spin-slow" />
            <span>AI Travel Intelligence Active</span>
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl font-[var(--font-display)]">
            Welcome back, {displayName}
          </h1>
          <p className="mt-2 max-w-xl text-xs sm:text-sm text-white/80 leading-relaxed">
            Your centralized multi-city workspace. Review upcoming stops, track ongoing budgets, and discover new destinations.
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-2 rounded-2xl bg-white/10 p-3 backdrop-blur-md border border-white/15">
          <div className="h-10 w-10 rounded-xl bg-accent-400/20 flex items-center justify-center text-accent-300">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-white/60 uppercase font-semibold">Active Hub</span>
            <p className="text-xs font-bold text-white">Global Explorer Mode</p>
          </div>
        </div>
      </div>
    </div>
  );
}
