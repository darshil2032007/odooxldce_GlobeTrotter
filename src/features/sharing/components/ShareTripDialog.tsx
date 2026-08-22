import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Share2,
  Copy,
  Check,
  Globe,
  Lock,
  ExternalLink,
  MessageCircle,
  Twitter,
  Mail,
  QrCode,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { enableTripSharing, disableTripSharing } from "../services/sharingService";
import { toast } from "sonner";
import type { Trip } from "@/types/database";

interface ShareTripDialogProps {
  trip: Trip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareTripDialog({
  trip,
  open,
  onOpenChange,
}: ShareTripDialogProps) {
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

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out my travel itinerary for "${trip.title}" on GlobeTrotter AI: ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `Planning my journey: "${trip.title}" on GlobeTrotter AI! 🌍✈️`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(
        shareUrl
      )}`,
      "_blank"
    );
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Travel Itinerary: ${trip.title}`);
    const body = encodeURIComponent(
      `Hi,\n\nTake a look at my trip itinerary for ${trip.title} on GlobeTrotter AI:\n${shareUrl}\n\nHappy travels!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary-500" />
            Share Trip Itinerary
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Public Toggle Switch */}
          <div className="flex items-center justify-between rounded-xl border border-surface-200 dark:border-surface-800 p-4 bg-surface-50 dark:bg-surface-900/50">
            <div className="flex items-start gap-3">
              <div
                className={`rounded-xl p-2.5 ${
                  trip.is_public
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-surface-200 dark:bg-surface-800 text-surface-400"
                }`}
              >
                {trip.is_public ? (
                  <Globe className="h-5 w-5" />
                ) : (
                  <Lock className="h-5 w-5" />
                )}
              </div>
              <div className="space-y-0.5">
                <Label
                  htmlFor="public-toggle"
                  className="text-sm font-bold text-surface-900 dark:text-surface-100 cursor-pointer"
                >
                  {trip.is_public ? "Public Access Active" : "Private Trip"}
                </Label>
                <p className="text-xs text-surface-500">
                  {trip.is_public
                    ? "Anyone with the link can view your itinerary & estimated budget (read-only)."
                    : "Only you can see this trip."}
                </p>
              </div>
            </div>

            <Switch
              id="public-toggle"
              checked={trip.is_public}
              onCheckedChange={(checked) =>
                toggleShareMutation.mutate(checked)
              }
              disabled={toggleShareMutation.isPending}
            />
          </div>

          {/* Link Section (Active if public) */}
          {trip.is_public && (
            <div className="space-y-3 animate-fade-in">
              <Label className="text-xs font-semibold text-surface-700 dark:text-surface-300">
                Public Share Link
              </Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="text-xs font-mono select-all bg-surface-50 dark:bg-surface-800"
                />
                <Button
                  onClick={handleCopy}
                  size="sm"
                  className="shrink-0 gap-1.5 text-xs font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>

              {/* Social Channels */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider block">
                  Quick Share
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareWhatsApp}
                    className="flex-1 gap-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareTwitter}
                    className="flex-1 gap-1.5 text-xs font-medium text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/20"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                    X (Twitter)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareEmail}
                    className="flex-1 gap-1.5 text-xs font-medium text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </Button>
                </div>
              </div>

              {/* Open in new tab preview */}
              <div className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full text-xs text-primary-600 hover:text-primary-700 gap-1.5 justify-center"
                >
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Preview Public Page
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
