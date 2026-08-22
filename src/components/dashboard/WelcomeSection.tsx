import { useAuth } from "@/hooks/useAuth";
import { Sparkles } from "lucide-react";

export function WelcomeSection() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || "Traveler";

  const quotes = [
    "The world is a book and those who do not travel read only one page.",
    "Travel makes one modest. You see what a tiny place you occupy in the world.",
    "Adventure is worthwhile in itself.",
  ];
  const randomQuote = quotes[0];

  return (
    <div className="relative overflow-hidden rounded-2xl gradient-hero p-6 text-white shadow-elevated lg:p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-accent-300" />
          <span>Ready for your next journey</span>
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
          Welcome back, {displayName}! 👋
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base">
          &ldquo;{randomQuote}&rdquo;
        </p>
      </div>
    </div>
  );
}
