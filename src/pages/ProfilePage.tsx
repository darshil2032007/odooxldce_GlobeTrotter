import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  User as UserIcon,
  MapPin,
  Calendar,
  Compass,
  Award,
  Heart,
  Share2,
  Edit3,
  CheckCircle2,
  Globe,
  Coins,
  ArrowRight,
  Plus,
  Plane,
  Camera,
  Layers,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useTrips } from "@/hooks/useTrips";
import { useCities } from "@/features/cities/hooks/useCities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
];

const PASSPORT_STAMPS = [
  {
    id: "stamp-1",
    title: "Global Wanderer",
    category: "Exploration",
    date: "August 2026",
    icon: Globe,
    unlocked: true,
    description: "Planned itineraries spanning 3 or more global cities.",
    color: "from-blue-600 to-indigo-700",
  },
  {
    id: "stamp-2",
    title: "Itinerary Architect",
    category: "Planning",
    date: "July 2026",
    icon: Compass,
    unlocked: true,
    description: "Organized 15+ curated activities with time slots and budgets.",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "stamp-3",
    title: "Budget Mastermind",
    category: "Finance",
    date: "June 2026",
    icon: Coins,
    unlocked: true,
    description: "Maintained expenses within 95% of target budget across trips.",
    color: "from-emerald-500 to-teal-700",
  },
  {
    id: "stamp-4",
    title: "Cultural Explorer",
    category: "Culture",
    date: "Pending",
    icon: Award,
    unlocked: false,
    description: "Visit 5 UNESCO heritage sites or historical attractions.",
    color: "from-purple-600 to-pink-600",
  },
];

export const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const { data: userTrips } = useTrips();
  const { data: cities } = useCities();

  // Edit profile modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fullName, setFullName] = useState(
    profile?.full_name || user?.user_metadata?.full_name || "Alex Traveler"
  );
  const [avatarUrl, setAvatarUrl] = useState(
    profile?.avatar_url ||
      user?.user_metadata?.avatar_url ||
      PRESET_AVATARS[0]
  );
  const [bio, setBio] = useState("Avid global explorer, cultural wanderer, and photographer.");
  const [isSaving, setIsSaving] = useState(false);

  // Compute travel metrics
  const trips = userTrips || [];
  const totalTrips = trips.length;
  const totalDestinations = trips.reduce((acc, t) => acc + (t.destinationCount || 1), 0);
  const totalBudgetSpent = trips.reduce((acc, t) => acc + (t.budgetSpent || 0), 0);

  // Wishlist preview from catalog
  const wishlistCities = (cities || []).slice(0, 3);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name cannot be blank");
      return;
    }

    setIsSaving(true);
    try {
      if (user?.id) {
        await updateProfileMutation.mutateAsync({
          userId: user.id,
          updates: {
            full_name: fullName,
            avatar_url: avatarUrl,
          },
        });
        await refreshProfile();
      }
      toast.success("Profile updated successfully!");
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareProfile = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Profile link copied to clipboard!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* 1. Hero Cover Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-900 text-white shadow-elevated">
        {/* Cover Photo */}
        <div className="h-48 sm:h-64 w-full overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&auto=format&fit=crop&q=80"
            alt="Travel Cover"
            className="h-full w-full object-cover opacity-60 filter brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/40 to-transparent" />
        </div>

        {/* Profile Card Header Inside Banner */}
        <div className="relative px-6 sm:px-10 pb-8 -mt-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar with status ring */}
            <div className="relative group">
              <img
                src={avatarUrl}
                alt={fullName}
                className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl object-cover ring-4 ring-white/20 shadow-2xl bg-surface-800"
              />
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold gap-1.5"
              >
                <Camera className="h-4 w-4" /> Change
              </button>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 ring-4 ring-surface-900 flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            {/* Traveler Titles */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-[var(--font-display)]">
                  {fullName}
                </h1>
                <Badge variant="accent" className="text-xs font-semibold uppercase tracking-wider">
                  Voyager Tier II
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-surface-300 flex items-center gap-2">
                <span>{user?.email || "alex.traveler@example.com"}</span>
                <span>•</span>
                <span className="text-accent-400 font-medium">Verified GlobeTrotter</span>
              </p>

              <p className="text-xs sm:text-sm text-surface-400 max-w-xl line-clamp-2 pt-1">
                {bio}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareProfile}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm gap-1.5 text-xs"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
            <Button
              size="sm"
              variant="accent"
              onClick={() => setIsEditModalOpen(true)}
              className="gap-1.5 text-xs shadow-glow"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Key Traveler Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card border-surface-200/80 transition-all hover:shadow-elevated hover:-translate-y-0.5">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Plane className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-surface-900">{totalTrips}</span>
              <p className="text-xs font-medium text-surface-500">Trips Planned</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-surface-200/80 transition-all hover:shadow-elevated hover:-translate-y-0.5">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-surface-900">{totalDestinations}</span>
              <p className="text-xs font-medium text-surface-500">Destinations Visited</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-surface-200/80 transition-all hover:shadow-elevated hover:-translate-y-0.5">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-surface-900">{formatCurrency(totalBudgetSpent)}</span>
              <p className="text-xs font-medium text-surface-500">Budget Optimized</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-surface-200/80 transition-all hover:shadow-elevated hover:-translate-y-0.5">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-surface-900">3 of 4</span>
              <p className="text-xs font-medium text-surface-500">Passport Badges</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Passport Stamps & Milestones */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-surface-900 font-[var(--font-display)] flex items-center gap-2">
              <Award className="h-5 w-5 text-accent-500" />
              Passport Stamps & Achievements
            </h2>
            <p className="text-xs text-surface-500">
              Unlock milestone badges by crafting itineraries, booking multi-city stops, and optimizing travel budgets.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PASSPORT_STAMPS.map((stamp) => (
            <div
              key={stamp.id}
              className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:shadow-elevated ${
                stamp.unlocked
                  ? "border-surface-200 bg-white shadow-card"
                  : "border-dashed border-surface-300 bg-surface-50 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md bg-gradient-to-br ${
                    stamp.unlocked ? stamp.color : "from-surface-400 to-surface-500 grayscale"
                  }`}
                >
                  <stamp.icon className="h-6 w-6" />
                </div>
                <Badge
                  variant={stamp.unlocked ? "secondary" : "outline"}
                  className="text-[10px] font-semibold uppercase"
                >
                  {stamp.unlocked ? "Unlocked" : "Locked"}
                </Badge>
              </div>

              <h4 className="text-sm font-bold text-surface-900">{stamp.title}</h4>
              <p className="text-xs text-surface-500 mt-1 leading-relaxed">{stamp.description}</p>

              <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between text-[11px] text-surface-400 font-medium">
                <span>{stamp.category}</span>
                <span>{stamp.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Travel Wishlist & Active Journeys */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Wishlist Column */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-surface-900 font-[var(--font-display)] flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
              Travel Wishlist
            </h3>
            <Button variant="ghost" size="sm" asChild className="text-xs text-primary-600 gap-1">
              <Link to="/cities">
                Explore All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {wishlistCities.map((city) => (
              <div
                key={city.id}
                className="group flex items-center gap-3.5 rounded-2xl border border-surface-200 bg-white p-3 shadow-sm transition-all hover:shadow-card hover:-translate-y-0.5"
              >
                <img
                  src={city.image_url || ""}
                  alt={city.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-surface-900 truncate group-hover:text-primary-600 transition-colors">
                    {city.name}
                  </h4>
                  <p className="text-xs text-surface-500 truncate">{city.country}</p>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    Cost Index: {city.cost_index.toFixed(1)}/5
                  </span>
                </div>
                <Button asChild size="icon" variant="ghost" className="h-8 w-8 rounded-xl shrink-0">
                  <Link to={`/trips/new?city=${city.id}`}>
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Trips Summary Column */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-surface-900 font-[var(--font-display)] flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary-600" />
              My Planned Itineraries
            </h3>
            <Button variant="ghost" size="sm" asChild className="text-xs text-primary-600 gap-1">
              <Link to="/trips">
                View All Trips <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {trips.slice(0, 2).map((trip) => (
              <div
                key={trip.id}
                className="group relative overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card transition-all hover:shadow-elevated hover:-translate-y-1"
              >
                <div className="relative h-36 w-full overflow-hidden bg-surface-900">
                  <img
                    src={trip.coverImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"}
                    alt={trip.name}
                    className="h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <Badge variant="default" className="absolute top-3 right-3 text-[10px] capitalize">
                    {trip.status}
                  </Badge>
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <h4 className="font-bold text-sm truncate">{trip.name}</h4>
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-surface-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(trip.startDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-surface-800">
                      {formatCurrency(trip.budgetSpent)} / {formatCurrency(trip.budgetTarget)}
                    </span>
                  </div>

                  <Button asChild size="sm" className="w-full text-xs gap-1.5">
                    <Link to={`/trips/${trip.id}?tab=itinerary`}>
                      Open Itinerary <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Edit Profile Modal Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-[var(--font-display)]">
              <UserIcon className="h-5 w-5 text-primary-600" />
              Edit Traveler Profile
            </DialogTitle>
            <DialogDescription>
              Update your public persona and traveler avatar shown to co-planners.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-surface-700">Choose Avatar</label>
              <div className="flex items-center gap-2">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`h-10 w-10 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                      avatarUrl === url
                        ? "border-primary-500 ring-2 ring-primary-500/30"
                        : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-surface-700">Full Name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Traveler"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-surface-700">Custom Image URL</label>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-surface-700">Bio / Travel Motto</label>
              <Input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your travel spirit"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
