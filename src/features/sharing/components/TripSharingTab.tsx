import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Globe,
  Lock,
  Copy,
  Check,
  Eye,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { enableTripSharing, disableTripSharing } from "../services/sharingService";
import { toast } from "sonner";
import type { TripWithDetails } from "@/types/database";

interface TripSharingTabProps {
  trip: TripWithDetails;
}

export function TripSharingTab({ trip }: TripSharingTabProps) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = trip.share_slug
    ? `${origin}/share/${trip.share_slug}`
    : `${origin}/share/trip-${trip.id.slice(0, 8)}`;

  const toggleShareMutation = useMutation({
    mutationFn: async (enable: boolean) => {
      if (enable) {
        return await enableTripSharing(trip.id, trip.share_slug);
      } else {
        return await disableTripSharing(trip.id);
      }
    },
    onSuccess: (_, enable) => {
      queryClient.invalidateQueries({ queryKey: ["trip", trip.id] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success(
        enable
          ? "Public sharing enabled! Anyone with the link can view this trip."
          : "Trip set to private."
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to update sharing settings"
      );
    },
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Share link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl">
      {/* Main Sharing Card */}
      <Card className="shadow-card border-surface-200 dark:border-surface-800">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-2xl p-3 ${
                trip.is_public
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-surface-100 dark:bg-surface-800 text-surface-400"
              }`}
            >
              {trip.is_public ? (
                <Globe className="h-6 w-6" />
              ) : (
                <Lock className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold">
                  Public Trip Sharing
                </CardTitle>
                <Badge
                  variant={trip.is_public ? "default" : "outline"}
                  className={`text-xs ${
                    trip.is_public
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "text-surface-500"
                  }`}
                >
                  {trip.is_public ? "Public" : "Private"}
                </Badge>
              </div>
              <p className="text-xs text-surface-500 mt-0.5">
                Share a read-only itinerary link with friends, family, or travel communities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-surface-600 dark:text-surface-400">
              {trip.is_public ? "Enabled" : "Disabled"}
            </span>
            {/* Custom accessible toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={trip.is_public}
              onClick={() => toggleShareMutation.mutate(!trip.is_public)}
              disabled={toggleShareMutation.isPending}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                trip.is_public ? "bg-emerald-500" : "bg-surface-300 dark:bg-surface-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  trip.is_public ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {trip.is_public ? (
            <div className="space-y-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-surface-700 dark:text-surface-300">
                  Public Shareable URL
                </label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={shareUrl}
                    className="text-xs font-mono select-all bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-700"
                  />
                  <Button
                    onClick={handleCopy}
                    size="sm"
                    className="shrink-0 gap-1.5 text-xs font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-surface-500">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>
                    Privacy Protected: Personal emails & passwords are never exposed.
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-1.5 text-xs font-semibold"
                >
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Open Public View
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-surface-200 dark:border-surface-800 p-6 text-center space-y-2">
              <Lock className="mx-auto h-8 w-8 text-surface-400" />
              <h4 className="text-sm font-bold text-surface-800 dark:text-surface-200">
                This trip is currently private
              </h4>
              <p className="text-xs text-surface-500 max-w-sm mx-auto">
                Toggle the switch above to generate a unique public link that allows others to view and copy your itinerary.
              </p>
            </div>
          )}

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="rounded-xl border border-surface-200/70 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/40 p-4 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-surface-800 dark:text-surface-200">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Read-Only Safety</span>
              </div>
              <p className="text-[11px] text-surface-500 leading-relaxed">
                Public viewers cannot edit, modify, or delete any part of your itinerary.
              </p>
            </div>

            <div className="rounded-xl border border-surface-200/70 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/40 p-4 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-surface-800 dark:text-surface-200">
                <Copy className="h-4 w-4 text-primary-500" />
                <span>1-Click Trip Cloning</span>
              </div>
              <p className="text-[11px] text-surface-500 leading-relaxed">
                Other travelers can copy this trip into their account as a fresh template.
              </p>
            </div>

            <div className="rounded-xl border border-surface-200/70 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/40 p-4 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-surface-800 dark:text-surface-200">
                <Users className="h-4 w-4 text-indigo-500" />
                <span>Share Anywhere</span>
              </div>
              <p className="text-[11px] text-surface-500 leading-relaxed">
                Clean responsive design that looks stunning on mobile, desktop, and tablets.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
