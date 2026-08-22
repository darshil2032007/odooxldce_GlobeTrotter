import { Link } from "react-router-dom";
import { Globe, MapPin, DollarSign, Users, ArrowRight, Plane, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MapPin,
    title: "Multi-City Planning",
    description: "Plan complex itineraries spanning multiple cities and countries with ease.",
  },
  {
    icon: DollarSign,
    title: "Smart Budgeting",
    description: "Track expenses in real-time and get AI-powered budget recommendations.",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    description: "Get personalized destination and activity suggestions powered by AI.",
  },
  {
    icon: Users,
    title: "Collaborative Trips",
    description: "Plan together with friends and family with real-time collaboration.",
  },
];

const stats = [
  { value: "50K+", label: "Trips Planned" },
  { value: "120+", label: "Countries" },
  { value: "4.9★", label: "User Rating" },
  { value: "10K+", label: "Active Users" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-surface-900">GlobeTrotter</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-surface-600 transition-colors hover:text-surface-900">
              Features
            </a>
            <a href="#stats" className="text-sm font-medium text-surface-600 transition-colors hover:text-surface-900">
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="gradient-hero absolute inset-0 opacity-5" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-accent-400/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent-50 px-4 py-1.5 text-sm font-medium text-accent-700 ring-1 ring-accent-200">
              <Sparkles className="h-4 w-4" />
              AI-Powered Travel Planning
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl lg:text-6xl">
              Plan Your Perfect{" "}
              <span className="text-gradient">Multi-City Adventure</span>
            </h1>

            <p className="mb-8 text-lg text-surface-600 sm:text-xl">
              Create stunning itineraries, manage budgets intelligently, and explore the world
              with your personal AI travel assistant. Your dream trip is just a few clicks away.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link to="/signup">
                  Start Planning Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">
                  <Plane className="mr-2 h-4 w-4" />
                  View Demo
                </Link>
              </Button>
            </div>
          </div>

          {/* Floating elements */}
          <div className="pointer-events-none absolute left-10 top-1/3 animate-float opacity-20">
            <Plane className="h-12 w-12 text-primary-500" />
          </div>
          <div className="pointer-events-none absolute right-20 top-1/4 animate-float opacity-15" style={{ animationDelay: "2s" }}>
            <Globe className="h-16 w-16 text-accent-500" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y border-surface-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
                <div className="mt-1 text-sm text-surface-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-surface-900 sm:text-4xl">
              Everything You Need to Travel{" "}
              <span className="text-gradient">Smarter</span>
            </h2>
            <p className="text-lg text-surface-500">
              From planning to budgeting to sharing, GlobeTrotter has you covered.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-surface-200 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary-50 p-3 transition-colors group-hover:bg-primary-100">
                  <feature.icon className="h-6 w-6 text-primary-500" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-surface-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-surface-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl gradient-primary px-8 py-16 text-center text-white shadow-elevated sm:px-16">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent-400/20 blur-3xl" />
            </div>
            <div className="relative">
              <Shield className="mx-auto mb-6 h-12 w-12 opacity-90" />
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                Ready to Explore the World?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">
                Join thousands of travelers who plan smarter with GlobeTrotter AI.
                Start your first trip today — completely free.
              </p>
              <Button size="lg" variant="accent" asChild className="gap-2">
                <Link to="/signup">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-surface-900">GlobeTrotter AI</span>
            </div>
            <p className="text-sm text-surface-500">
              © 2026 GlobeTrotter AI. Built with ❤️ for travelers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
