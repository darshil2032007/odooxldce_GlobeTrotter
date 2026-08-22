import { Link } from "react-router-dom";
import {
  Globe,
  MapPin,
  Coins,
  Users,
  ArrowRight,
  Plane,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: MapPin,
    title: "Multi-City Route Planner",
    description:
      "Seamlessly string together global destinations, optimize travel dates, and calculate transfer times with precision.",
    tag: "Route Engine",
  },
  {
    icon: Coins,
    title: "Dynamic Smart Budgeting",
    description:
      "Track multi-currency expenses in real time and let intelligent algorithms prevent itinerary overspending.",
    tag: "Finance AI",
  },
  {
    icon: Sparkles,
    title: "Curated Activity Catalog",
    description:
      "Explore hand-picked landmark sights, hidden culinary spots, and cultural experiences across 100+ cities.",
    tag: "Experiences",
  },
  {
    icon: Users,
    title: "Real-Time Co-Planning",
    description:
      "Collaborate with travel companions, assign stop activities, and share interactive live itineraries effortlessly.",
    tag: "Collaboration",
  },
];

const showcaseDestinations = [
  {
    name: "Amalfi Coast & Rome",
    country: "Italy",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80",
    days: "8 Days",
    stops: "Rome • Positano • Capri",
    cost: "$2,400",
  },
  {
    name: "Kyoto & Tokyo Golden Route",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80",
    days: "10 Days",
    stops: "Tokyo • Hakone • Kyoto",
    cost: "$3,150",
  },
  {
    name: "Swiss Alpine Journey",
    country: "Switzerland",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80",
    days: "7 Days",
    stops: "Zurich • Interlaken • Zermatt",
    cost: "$2,850",
  },
];

const stats = [
  { value: "50,000+", label: "Multi-City Trips Planned" },
  { value: "120+", label: "Global Destinations" },
  { value: "99.4%", label: "Schedule Precision Rate" },
  { value: "4.9 / 5", label: "Traveler Satisfaction" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 selection:bg-primary-500 selection:text-white">
      {/* 1. Header Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-surface-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-sm">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-surface-900 font-[var(--font-display)]">
              GlobeTrotter
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-xs font-semibold uppercase tracking-wider text-surface-600 transition-colors hover:text-primary-600"
            >
              Platform Features
            </a>
            <a
              href="#destinations"
              className="text-xs font-semibold uppercase tracking-wider text-surface-600 transition-colors hover:text-primary-600"
            >
              Destinations
            </a>
            <a
              href="#stats"
              className="text-xs font-semibold uppercase tracking-wider text-surface-600 transition-colors hover:text-primary-600"
            >
              Metrics
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-xs font-semibold">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="sm" variant="accent" asChild className="text-xs font-semibold shadow-glow">
              <Link to="/signup">
                Get Started <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section with Live Itinerary Preview */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-36 lg:pb-32">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent-300/15 blur-3xl" />
          <div className="absolute top-1/3 -left-40 h-[600px] w-[600px] rounded-full bg-primary-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Hero Text */}
            <div className="space-y-6 text-center lg:text-left lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50/80 px-4 py-1.5 text-xs font-semibold text-accent-800 shadow-sm backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-accent-600" />
                <span>Next-Generation Travel Operating System</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-surface-900 sm:text-5xl lg:text-6xl font-[var(--font-display)] leading-[1.1]">
                Master the Art of{" "}
                <span className="text-gradient">Multi-City Travel</span>
              </h1>

              <p className="text-base sm:text-lg text-surface-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Craft day-wise itineraries across multiple countries, balance budgets automatically,
                and discover curated activities with an intelligent companion designed for modern explorers.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button size="lg" variant="accent" asChild className="w-full sm:w-auto text-sm font-semibold shadow-elevated gap-2 px-6 py-6">
                  <Link to="/signup">
                    <span>Create Your First Trip</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-sm font-semibold border-surface-300 px-6 py-6">
                  <Link to="/login">
                    <span>Explore Live Demo</span>
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-surface-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Real-time budget tracking</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Offline calendar sync</span>
                </div>
              </div>
            </div>

            {/* Right Column: Handcrafted Glassmorphic Itinerary Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl border border-surface-200/80 bg-white p-6 shadow-elevated backdrop-blur-xl">
                {/* Trip Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-surface-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                      <Plane className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-surface-900">Mediterranean Odyssey</h3>
                      <p className="text-xs text-surface-500">12 Days • 3 Cities Planned</p>
                    </div>
                  </div>
                  <Badge variant="default" className="text-[11px]">
                    Upcoming
                  </Badge>
                </div>

                {/* Stops Timeline */}
                <div className="py-5 space-y-4">
                  {/* Stop 1 */}
                  <div className="flex items-start gap-3.5 relative">
                    <div className="flex flex-col items-center">
                      <div className="h-7 w-7 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">
                        1
                      </div>
                      <div className="w-0.5 h-12 bg-surface-200 my-1" />
                    </div>
                    <div className="flex-1 bg-surface-50 rounded-2xl p-3 border border-surface-100">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-surface-900">Barcelona, Spain</span>
                        <span className="text-[10px] text-surface-500 font-medium">Days 1 - 4</span>
                      </div>
                      <p className="text-[11px] text-surface-500 mt-1">Sagrada Família & Gothic Quarter Tour</p>
                    </div>
                  </div>

                  {/* Stop 2 */}
                  <div className="flex items-start gap-3.5 relative">
                    <div className="flex flex-col items-center">
                      <div className="h-7 w-7 rounded-full bg-accent-500 text-white text-xs font-bold flex items-center justify-center">
                        2
                      </div>
                      <div className="w-0.5 h-12 bg-surface-200 my-1" />
                    </div>
                    <div className="flex-1 bg-surface-50 rounded-2xl p-3 border border-surface-100">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-surface-900">Nice & Monaco, France</span>
                        <span className="text-[10px] text-surface-500 font-medium">Days 5 - 8</span>
                      </div>
                      <p className="text-[11px] text-surface-500 mt-1">Promenade des Anglais & Coastal Drive</p>
                    </div>
                  </div>

                  {/* Stop 3 */}
                  <div className="flex items-start gap-3.5">
                    <div className="h-7 w-7 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                      3
                    </div>
                    <div className="flex-1 bg-surface-50 rounded-2xl p-3 border border-surface-100">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-surface-900">Florence, Italy</span>
                        <span className="text-[10px] text-surface-500 font-medium">Days 9 - 12</span>
                      </div>
                      <p className="text-[11px] text-surface-500 mt-1">Uffizi Gallery & Tuscan Wine Tasting</p>
                    </div>
                  </div>
                </div>

                {/* Card Footer Metrics */}
                <div className="rounded-2xl bg-surface-900 p-3.5 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/60 uppercase tracking-wider font-semibold">Budget Health</span>
                    <p className="text-sm font-bold text-emerald-400">$3,200 of $4,000 target</p>
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-white text-xs">
                    80% Spent
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Platform Capabilities Section */}
      <section id="features" className="py-20 bg-white border-y border-surface-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider text-primary-600">
              Architected for Perfection
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl font-[var(--font-display)]">
              Everything You Need to Plan Without Friction
            </h2>
            <p className="text-sm sm:text-base text-surface-500">
              Transform chaotic travel bookmarks and spreadsheets into a clean, unified workspace.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((item, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-3xl border border-surface-200/80 bg-surface-50/50 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white hover:shadow-elevated"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                  <item.icon className="h-6 w-6" />
                </div>

                <div className="mt-6 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600">
                    {item.tag}
                  </span>
                  <h3 className="text-base font-bold text-surface-900 font-[var(--font-display)]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-surface-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Showcase Curated Journeys */}
      <section id="destinations" className="py-20 bg-surface-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider text-accent-600">
                Curated Itineraries
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl font-[var(--font-display)] mt-2">
                Popular Multi-City Routes
              </h2>
            </div>
            <Button variant="ghost" asChild className="gap-1 text-primary-600 font-semibold text-xs">
              <Link to="/cities">
                Browse All Destinations <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {showcaseDestinations.map((dest, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elevated"
              >
                <div className="relative h-60 w-full overflow-hidden bg-surface-900">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-md text-[11px]">
                      {dest.days}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-xs font-medium text-white/80">{dest.country}</span>
                    <h3 className="text-lg font-bold truncate">{dest.name}</h3>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs text-surface-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-accent-500 shrink-0" />
                    <span className="truncate">{dest.stops}</span>
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-surface-100">
                    <div>
                      <span className="text-[10px] text-surface-400 font-medium">Estimated Budget</span>
                      <p className="text-sm font-bold text-surface-900">{dest.cost}</p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="text-xs gap-1">
                      <Link to="/signup">
                        View Plan <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Metrics Strip */}
      <section id="stats" className="py-16 bg-surface-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 grid-cols-2 lg:grid-cols-4 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-accent-400 font-[var(--font-display)]">
                  {stat.value}
                </span>
                <p className="text-xs sm:text-sm text-surface-300 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Footer Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 text-center text-white shadow-elevated sm:p-12">
            <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-[var(--font-display)]">
                Ready to Experience Stress-Free Travel Planning?
              </h2>
              <p className="text-sm sm:text-base text-white/85">
                Join thousands of globe-trotters organizing their next dream journey today.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" variant="accent" asChild className="w-full sm:w-auto text-sm font-semibold shadow-glow">
                  <Link to="/signup">Start Free Today</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 bg-surface-50 py-8 text-center text-xs text-surface-500">
        <div className="mx-auto max-w-7xl px-4">
          <p>© 2026 GlobeTrotter AI. Built with precision for modern travelers.</p>
        </div>
      </footer>
    </div>
  );
}
