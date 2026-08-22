import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  Coins,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  Compass,
  ArrowRight,
  TrendingDown,
  Share2,
  ShieldCheck,
  BarChart3,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AITripGeneratorModal } from "@/components/ai/AITripGeneratorModal";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/context/CurrencyContext";

const CORE_FEATURES = [
  {
    icon: Sparkles,
    badge: "Gemini 2.5 Flash",
    badgeColor: "bg-amber-400/10 text-amber-500 border-amber-400/30",
    title: "Plan with Generative AI",
    description:
      "Describe your dream journey in plain words. Gemini synthesizes multi-city stops, day themes, and scheduled activities validated against verified catalog entities.",
  },
  {
    icon: BarChart3,
    badge: "Deterministic Math",
    badgeColor: "bg-emerald-400/10 text-emerald-500 border-emerald-400/30",
    title: "Zero-Hallucination Budget Engine",
    description:
      "Mathematical cost tracking, Recharts interactive donut & daily bar breakdowns, peak expense detection, and receipt tracking that never invents numbers.",
  },
  {
    icon: TrendingDown,
    badge: "Smart Assistant",
    badgeColor: "bg-primary-400/10 text-primary-500 border-primary-400/30",
    title: "Deficit Resolution & Optimizer",
    description:
      "Detects over-budget deficits instantly and provides 1-click catalog activity replacements that preserve sightseeing while saving thousands.",
  },
  {
    icon: Bot,
    badge: "Trip Copilot",
    badgeColor: "bg-indigo-400/10 text-indigo-500 border-indigo-400/30",
    title: "Context-Aware Travel Copilot",
    description:
      "Floating AI assistant embedded in your workspace. Ask about packing essentials, authentic street food spots, and pacing advice backed by verified trip context.",
  },
  {
    icon: Calendar,
    badge: "Itinerary Engine",
    badgeColor: "bg-cyan-400/10 text-cyan-500 border-cyan-400/30",
    title: "Timeline & Calendar Grid",
    description:
      "Day-by-day schedule breakdown, morning/afternoon/evening time blocks, stop reordering, and schedule validation alerts for seamless pacing.",
  },
  {
    icon: Compass,
    badge: "Weighted Algorithm",
    badgeColor: "bg-rose-400/10 text-rose-500 border-rose-400/30",
    title: "Destination Matchmaker",
    description:
      "4-factor deterministic scoring matching budget, travel style, duration, and interests with personalized Gemini reasoning for every city.",
  },
  {
    icon: Share2,
    badge: "Trip Sharing",
    badgeColor: "bg-purple-400/10 text-purple-500 border-purple-400/30",
    title: "Public Sharing & 1-Click Copy",
    description:
      "Generate clean, privacy-protected /share/:slug URLs for family & friends with 1-click deep cloning into your own itinerary builder.",
  },
  {
    icon: Coins,
    badge: "Global Currency",
    badgeColor: "bg-amber-400/10 text-amber-500 border-amber-400/30",
    title: "Real-Time Multi-Currency",
    description:
      "Seamlessly switch display currency across INR (₹), USD ($), EUR (€), GBP (£), JPY (¥), AED, AUD, and CAD with live exchange rate conversion.",
  },
];

const SHOWCASE_DESTINATIONS = [
  {
    name: "Goa Coastal Odyssey",
    region: "Goa, India",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80",
    days: "5 Days",
    stops: "Panaji • Calangute • Fort Aguada",
    baseCostINR: 32000,
    matchScore: 94,
    style: "Relaxed & Food",
  },
  {
    name: "Royal Rajasthan Heritage",
    region: "Rajasthan, India",
    image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=800&auto=format&fit=crop&q=80",
    days: "6 Days",
    stops: "Jaipur • Udaipur • Jodhpur",
    baseCostINR: 42000,
    matchScore: 91,
    style: "Culture & Palaces",
  },
  {
    name: "Mumbai City of Dreams",
    region: "Maharashtra, India",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80",
    days: "4 Days",
    stops: "Marine Drive • Colaba • Bandra",
    baseCostINR: 28000,
    matchScore: 89,
    style: "Urban & Dining",
  },
];

const STATS = [
  { value: "100%", label: "Deterministic Accuracy" },
  { value: "Gemini 2.5", label: "Generative AI Engine" },
  { value: "8 Currencies", label: "Live Exchange Support" },
  { value: "< 2.5s", label: "Instant Itinerary Synthesis" },
];

export function LandingPage() {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 selection:bg-primary-500 selection:text-white">
      {/* 1. Header Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-surface-200/60 dark:border-surface-800/60 bg-white/85 dark:bg-surface-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 shadow-sm text-white">
              <Globe className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-surface-900 dark:text-white font-[var(--font-display)]">
              GlobeTrotter<span className="text-primary-500">.ai</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-xs font-semibold uppercase tracking-wider text-surface-600 dark:text-surface-300 hover:text-primary-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#destinations"
              className="text-xs font-semibold uppercase tracking-wider text-surface-600 dark:text-surface-300 hover:text-primary-600 transition-colors"
            >
              Destinations
            </a>
            <a
              href="#architecture"
              className="text-xs font-semibold uppercase tracking-wider text-surface-600 dark:text-surface-300 hover:text-primary-600 transition-colors"
            >
              AI & Architecture
            </a>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild className="gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-md">
                <Link to="/dashboard">
                  <Compass className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-xs font-semibold">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button
                  onClick={() => setIsAIModalOpen(true)}
                  className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-surface-950 font-bold shadow-md"
                >
                  <Sparkles className="h-4 w-4" />
                  ✨ Plan with AI
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-300 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                <span>Powered by Gemini 2.5 Flash & Deterministic Engine</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-surface-900 dark:text-white leading-[1.1] font-[var(--font-display)]">
                The Intelligent Travel Planner That{" "}
                <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-amber-500 bg-clip-text text-transparent">
                  Reasons, Optimizes
                </span>{" "}
                & Never Overspends.
              </h1>

              <p className="text-base sm:text-lg text-surface-600 dark:text-surface-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Synthesize custom multi-city itineraries in seconds with Gemini AI, balance daily pacing on interactive calendar timelines, and eliminate budget deficits with mathematical precision.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  size="lg"
                  onClick={() => setIsAIModalOpen(true)}
                  className="w-full sm:w-auto gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-surface-950 font-extrabold px-8 py-6 text-base shadow-xl hover:shadow-orange-500/20 hover:scale-105 transition-all"
                >
                  <Sparkles className="h-5 w-5" />
                  ✨ Plan with AI Now
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto gap-2 border-surface-300 dark:border-surface-700 font-bold px-8 py-6 text-base hover:bg-surface-100 dark:hover:bg-surface-900"
                >
                  <Link to="/trips">
                    Explore Sample Trips
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Trust Features */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-semibold text-surface-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Deterministic Arithmetic</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary-500" />
                  <span>Real Database Catalogs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span>Multi-Currency Active</span>
                </div>
              </div>
            </div>

            {/* Hero Right Column: Live Interactive Preview Widget */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-surface-200/80 dark:border-surface-800 bg-white/90 dark:bg-surface-900/90 p-5 shadow-2xl backdrop-blur-xl space-y-4">
                {/* Header preview bar */}
                <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 rounded-full bg-rose-500" />
                    <span className="flex h-3 w-3 rounded-full bg-amber-500" />
                    <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold ml-2 text-surface-700 dark:text-surface-300 font-mono">
                      Goa Coastal Expedition
                    </span>
                  </div>
                  <Badge className="bg-primary-600 text-white text-[10px] py-0 px-2">
                    5 Days • 94% Match
                  </Badge>
                </div>

                {/* Live Itinerary Timeline Snippet */}
                <div className="space-y-2.5">
                  <div className="rounded-xl bg-surface-50 dark:bg-surface-800/50 p-3 border border-surface-200/60 dark:border-surface-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-surface-900 dark:text-surface-100">
                      <span>Day 1: Old Goa Portuguese Heritage</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{formatAmount(350)}</span>
                    </div>
                    <div className="text-[11px] text-surface-500 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 09:30 AM</span>
                      <span>Basilica of Bom Jesus Guided Tour</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-surface-50 dark:bg-surface-800/50 p-3 border border-surface-200/60 dark:border-surface-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-surface-900 dark:text-surface-100">
                      <span>Day 2: Coastal Sunset & Shacks</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{formatAmount(650)}</span>
                    </div>
                    <div className="text-[11px] text-surface-500 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 05:00 PM</span>
                      <span>Anjuna Beach Sunset & Local Seafood</span>
                    </div>
                  </div>
                </div>

                {/* Live Budget Gauge */}
                <div className="rounded-2xl bg-gradient-to-br from-surface-900 to-indigo-950 p-4 text-white space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Smart Budget Health
                    </span>
                    <span className="text-emerald-400">91% On Track</span>
                  </div>

                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-surface-400 text-xs">Total Estimated:</span>
                    <span className="text-lg font-black text-white">{formatAmount(32000)} / {formatAmount(35000)}</span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" style={{ width: "91%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Stats Strip */}
      <section className="border-y border-surface-200/80 dark:border-surface-800 bg-white dark:bg-surface-900/60 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-primary-600 dark:text-primary-400 font-[var(--font-display)]">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Complete Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge className="bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/30 text-xs py-1">
            Built for Modern Explorers
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-surface-900 dark:text-white font-[var(--font-display)]">
            Everything You Need to Plan, Optimize & Share Multi-City Travel
          </h2>
          <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400 leading-relaxed">
            A harmonious fusion of Gemini Generative AI reasoning and mathematically verified budget calculation engines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CORE_FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card
                key={idx}
                className="group rounded-3xl border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-primary-500/10 p-3 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className={`text-[10px] py-0.5 px-2 font-bold ${feat.badgeColor}`}>
                      {feat.badge}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-surface-900 dark:text-surface-100 font-[var(--font-display)]">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 5. Showcase Destinations Section */}
      <section id="destinations" className="py-20 bg-surface-100/50 dark:bg-surface-900/30 border-y border-surface-200 dark:border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-surface-900 dark:text-white font-[var(--font-display)]">
                Featured AI-Synthesized Expeditions
              </h2>
              <p className="text-xs sm:text-sm text-surface-500">
                Explore real multi-city itineraries with dynamic pricing formatted in your active currency.
              </p>
            </div>

            <Button
              onClick={() => setIsAIModalOpen(true)}
              className="gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs"
            >
              <Sparkles className="h-4 w-4" />
              Generate Your Own
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SHOWCASE_DESTINATIONS.map((dest, idx) => (
              <div
                key={idx}
                className="group rounded-3xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 w-full overflow-hidden bg-surface-800">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-emerald-500 text-white text-xs font-bold shadow-md">
                      {dest.matchScore}% Match
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-[11px] text-accent-300 font-medium block">{dest.region}</span>
                    <h4 className="text-base font-extrabold">{dest.name}</h4>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2 text-xs text-surface-500">
                    <div className="flex items-center justify-between font-semibold">
                      <span>{dest.days}</span>
                      <span className="text-primary-600 dark:text-primary-400 font-bold">{dest.style}</span>
                    </div>
                    <p className="text-[11px] text-surface-400 truncate">{dest.stops}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-surface-100 dark:border-surface-800">
                    <div>
                      <span className="text-[10px] text-surface-400 block uppercase">Est. Total</span>
                      <span className="text-base font-black text-surface-900 dark:text-surface-100">
                        {formatAmount(dest.baseCostINR)}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => setIsAIModalOpen(true)}
                      className="text-xs font-bold gap-1 bg-surface-900 hover:bg-surface-800 text-white dark:bg-surface-100 dark:text-surface-900"
                    >
                      <Sparkles className="h-3 w-3" />
                      Plan Similar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Call to Action Footer Banner */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-surface-900 via-surface-950 to-primary-950 p-8 sm:p-14 text-white text-center space-y-6 shadow-2xl border border-surface-800">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-4 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-400/30">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Ready for your next expedition?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-[var(--font-display)] max-w-2xl mx-auto">
            Design Your Perfect Multi-City Itinerary in Seconds.
          </h2>

          <p className="text-surface-300 text-sm sm:text-base max-w-xl mx-auto">
            Join thousands of travelers who plan with zero spreadsheet headaches and AI-powered accuracy.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => setIsAIModalOpen(true)}
              className="w-full sm:w-auto gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-surface-950 font-extrabold px-8 py-6 text-base shadow-xl"
            >
              <Sparkles className="h-5 w-5" />
              ✨ Start Planning with AI
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 font-bold px-8 py-6 text-base"
            >
              <Link to="/login">Sign In / Register</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-surface-200 dark:border-surface-800 py-8 bg-white dark:bg-surface-950 text-xs text-surface-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary-500" />
            <span className="font-bold text-surface-800 dark:text-surface-200">GlobeTrotter AI</span>
            <span>• Intelligent Multi-City Travel Planner</span>
          </div>
          <p>© {new Date().getFullYear()} GlobeTrotter AI. All rights reserved.</p>
        </div>
      </footer>

      {/* AI Trip Modal */}
      <AITripGeneratorModal
        open={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
      />
    </div>
  );
}
