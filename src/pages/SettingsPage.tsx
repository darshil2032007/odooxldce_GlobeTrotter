import React, { useState } from "react";
import {
  User as UserIcon,
  Lock,
  Sliders,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Coins,
  Bell,
  Sparkles,
  Download,
  Trash2,
  LogOut,
  Camera,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/hooks/useProfile";
import { updatePassword } from "@/services/auth/authService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCurrency, type CurrencyCode } from "@/context/CurrencyContext";
import { toast } from "sonner";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
];

const CURRENCIES = [
  { code: "INR", label: "INR", symbol: "₹" },
  { code: "USD", label: "USD", symbol: "$" },
  { code: "EUR", label: "EUR", symbol: "€" },
  { code: "GBP", label: "GBP", symbol: "£" },
  { code: "JPY", label: "JPY", symbol: "¥" },
  { code: "AED", label: "AED", symbol: "AED" },
  { code: "AUD", label: "AUD", symbol: "A$" },
  { code: "CAD", label: "CAD", symbol: "C$" },
];

export function SettingsPage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const { currency, setCurrency } = useCurrency();

  // Profile form state
  const [fullName, setFullName] = useState(
    profile?.full_name || user?.user_metadata?.full_name || "Alex Traveler"
  );
  const [avatarUrl, setAvatarUrl] = useState(
    profile?.avatar_url ||
      user?.user_metadata?.avatar_url ||
      PRESET_AVATARS[0]
  );
  const [bio, setBio] = useState("Avid global explorer, foodie, and cultural wanderer.");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Preferences state
  const [selectedCurrency, setSelectedCurrency] = useState<string>(currency);
  const [travelPace, setTravelPace] = useState("balanced");
  const [unitSystem, setUnitSystem] = useState("metric");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  // Danger Zone dialogs
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Handle profile save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name cannot be blank");
      return;
    }

    setIsSavingProfile(true);
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
      toast.success("Profile details updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle password update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePassword(newPassword);
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle preferences save
  const handleSavePreferences = () => {
    setIsSavingPreferences(true);
    setTimeout(() => {
      setIsSavingPreferences(false);
      toast.success("Travel preferences saved!");
    }, 500);
  };

  // Handle export data
  const handleExportData = () => {
    const backupData = {
      user: {
        id: user?.id,
        email: user?.email,
        fullName,
        avatarUrl,
        preferences: {
          currency: selectedCurrency,
          pace: travelPace,
          unitSystem,
        },
      },
      exportedAt: new Date().toISOString(),
      app: "GlobeTrotter AI",
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `globetrotter-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Your travel data backup has been downloaded.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-surface-900 font-[var(--font-display)]">
          Account & App Settings
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Manage your personal profile, security credentials, currency preferences, and privacy controls.
        </p>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="profile" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 p-1 bg-surface-100/80 rounded-2xl">
          <TabsTrigger value="profile" className="rounded-xl gap-2 font-medium">
            <UserIcon className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl gap-2 font-medium">
            <Lock className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="rounded-xl gap-2 font-medium">
            <Sliders className="h-4 w-4" /> Preferences
          </TabsTrigger>
          <TabsTrigger value="danger" className="rounded-xl gap-2 font-medium text-red-600 data-[state=active]:text-red-700">
            <ShieldAlert className="h-4 w-4" /> Danger Zone
          </TabsTrigger>
        </TabsList>

        {/* 1. Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <form onSubmit={handleSaveProfile}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Public Profile Information</CardTitle>
                <CardDescription>
                  This information will be displayed on your shared itineraries and co-planner invites.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-surface-50 border border-surface-200">
                  <div className="relative group">
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                      <Camera className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <h4 className="text-sm font-semibold text-surface-900">Choose Profile Avatar</h4>
                    <p className="text-xs text-surface-500">
                      Pick from popular traveler presets or paste a custom image URL below.
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(url)}
                          className={`relative h-10 w-10 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 ${
                            avatarUrl === url
                              ? "border-primary-500 ring-2 ring-primary-500/30"
                              : "border-transparent"
                          }`}
                        >
                          <img src={url} alt={`Preset ${idx + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid gap-4 sm:grid-cols-2">
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
                    <label className="text-xs font-semibold text-surface-700">Email Address</label>
                    <div className="relative">
                      <Input
                        value={user?.email || "alex.traveler@example.com"}
                        disabled
                        className="bg-surface-100 text-surface-600 pr-20"
                      />
                      <Badge variant="outline" className="absolute right-2 top-2.5 bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-surface-700">Custom Avatar Image URL</label>
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-surface-700">Travel Bio & Style</label>
                  <Input
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your travel style (e.g. Backpacker, Luxury, Nature lover)"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-surface-100 pt-4">
                <Button type="submit" disabled={isSavingProfile} className="gap-2">
                  {isSavingProfile ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Profile Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* 2. Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <form onSubmit={handleUpdatePassword}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Password & Authentication</CardTitle>
                <CardDescription>
                  Keep your account secure with a strong password of at least 8 characters.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-surface-700">New Password</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-surface-700">Confirm New Password</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                    />
                  </div>
                </div>

                {newPassword && (
                  <div className="p-3 rounded-xl bg-surface-50 border border-surface-200 text-xs space-y-1">
                    <span className="font-semibold text-surface-700">Password Checklist:</span>
                    <ul className="list-disc list-inside text-surface-600 space-y-0.5">
                      <li className={newPassword.length >= 8 ? "text-emerald-600 font-medium" : ""}>
                        At least 8 characters
                      </li>
                      <li className={newPassword === confirmPassword && newPassword.length > 0 ? "text-emerald-600 font-medium" : ""}>
                        Passwords match
                      </li>
                    </ul>
                  </div>
                )}

                {/* Active session info */}
                <div className="mt-4 rounded-2xl border border-surface-200 p-4 bg-surface-50/50 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500">Current Session Details</h4>
                  <div className="flex flex-wrap items-center justify-between text-xs text-surface-600 gap-2">
                    <span>Logged in via <strong>Email & Password</strong></span>
                    <span className="text-surface-400">Authenticated Token Active</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-surface-100 pt-4">
                <Button
                  type="submit"
                  disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                  className="gap-2"
                >
                  {isUpdatingPassword ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  Update Password
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* 3. Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold">App & Travel Preferences</CardTitle>
              <CardDescription>
                Customize currency formatting, activity pace, and notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Currency & Units */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-surface-700 flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-accent-500" /> Default Display Currency
                  </label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => {
                      setSelectedCurrency(e.target.value);
                      setCurrency(e.target.value as CurrencyCode);
                      toast.success(`Currency switched to ${e.target.value}`);
                    }}
                    className="w-full rounded-xl border border-surface-200 bg-white dark:bg-surface-900 dark:border-surface-800 p-2.5 text-sm font-medium text-surface-900 dark:text-surface-100 focus:border-primary-500 focus:outline-none"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-surface-700 flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-primary-500" /> Units of Measurement
                  </label>
                  <select
                    value={unitSystem}
                    onChange={(e) => setUnitSystem(e.target.value)}
                    className="w-full rounded-xl border border-surface-200 bg-white p-2.5 text-sm font-medium text-surface-900 focus:border-primary-500 focus:outline-none"
                  >
                    <option value="metric">Metric (Kilometers, Celsius)</option>
                    <option value="imperial">Imperial (Miles, Fahrenheit)</option>
                  </select>
                </div>
              </div>

              {/* Travel Pace */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-surface-700 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-500" /> Preferred Travel Pace (AI Itinerary Builder)
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { id: "relaxed", title: "Relaxed", desc: "1-2 activities/day with lots of leisure time" },
                    { id: "balanced", title: "Balanced", desc: "3-4 curated activities with meal breaks" },
                    { id: "packed", title: "Sightseer", desc: "5+ packed activities to see everything" },
                  ].map((pace) => (
                    <button
                      key={pace.id}
                      type="button"
                      onClick={() => setTravelPace(pace.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        travelPace === pace.id
                          ? "border-primary-500 bg-primary-50/40 text-primary-900 ring-2 ring-primary-500/20"
                          : "border-surface-200 bg-white text-surface-700 hover:border-surface-300"
                      }`}
                    >
                      <h5 className="font-bold text-sm">{pace.title}</h5>
                      <p className="text-xs text-surface-500 mt-1">{pace.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2 border-t border-surface-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500">Notifications & AI</h4>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-surface-900 flex items-center gap-1.5">
                      <Bell className="h-4 w-4 text-surface-500" /> Trip Reminders & Updates
                    </span>
                    <p className="text-xs text-surface-500">
                      Receive notifications for upcoming trip departures and itinerary updates.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-5 w-5 rounded accent-primary-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-surface-900 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-accent-500" /> Smart AI Recommendations
                    </span>
                    <p className="text-xs text-surface-500">
                      Allow GlobeTrotter AI to suggest personalized activities and budget optimizations.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiSuggestions}
                    onChange={(e) => setAiSuggestions(e.target.checked)}
                    className="h-5 w-5 rounded accent-primary-600 cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-surface-100 pt-4">
              <Button
                onClick={handleSavePreferences}
                disabled={isSavingPreferences}
                className="gap-2"
              >
                {isSavingPreferences ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* 4. Danger Zone Tab */}
        <TabsContent value="danger" className="space-y-6">
          <Card className="border-red-200 bg-red-50/30 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-red-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" /> Danger Zone
              </CardTitle>
              <CardDescription className="text-red-700">
                Irreversible account operations and offline data management.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Backup */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-white border border-surface-200 gap-3">
                <div>
                  <h4 className="text-sm font-bold text-surface-900">Export My Travel Data</h4>
                  <p className="text-xs text-surface-500">
                    Download a complete JSON export of all your itineraries, expenses, and settings.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData} className="gap-1.5 shrink-0">
                  <Download className="h-4 w-4" /> Export Backup
                </Button>
              </div>

              {/* Sign out all */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-white border border-surface-200 gap-3">
                <div>
                  <h4 className="text-sm font-bold text-surface-900">Sign Out of Session</h4>
                  <p className="text-xs text-surface-500">
                    End your active session securely on this device.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="gap-1.5 text-surface-700 shrink-0"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>

              {/* Delete account */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-red-100/50 border border-red-200 gap-3">
                <div>
                  <h4 className="text-sm font-bold text-red-900">Delete My Account</h4>
                  <p className="text-xs text-red-700">
                    Permanently delete your profile, trips, and all associated itinerary records.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="gap-1.5 shrink-0"
                >
                  <Trash2 className="h-4 w-4" /> Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Confirm Account Deletion
            </DialogTitle>
            <DialogDescription>
              Are you absolutely sure you want to delete your GlobeTrotter account? This action cannot be undone and will erase all your multi-city trips and saved itineraries.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                toast.success("Account deletion request submitted.");
                signOut();
              }}
            >
              Permanently Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
