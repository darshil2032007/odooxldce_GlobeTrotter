import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  Compass,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Receipt,
  MapPin,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  generateAITripPlan,
  commitAITripPlan,
  type ResolvedTripPlan,
} from "@/services/ai/tripGenerator";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import { toast } from "sonner";

interface AITripGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_PROMPTS = [
  "Plan a 5-day Goa trip for two with ₹35,000 budget. We love beach sunsets, Portuguese food, and coastal adventure.",
  "Create a 4-day royal heritage tour in Jaipur & Udaipur with ₹45,000 budget focusing on palaces and vibrant bazaars.",
  "Design a relaxed 3-day Ahmedabad heritage & street food trip with ₹15,000 budget.",
];

export function AITripGeneratorModal({
  open,
  onOpenChange,
}: AITripGeneratorModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [prompt, setPrompt] = useState("");
  const [targetBudget, setTargetBudget] = useState("35000");
  const [durationDays, setDurationDays] = useState("5");
  const [generatedPlan, setGeneratedPlan] = useState<ResolvedTripPlan | null>(
    null
  );
  const [isCommitting, setIsCommitting] = useState(false);

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!prompt.trim()) throw new Error("Please enter your trip ideas");
      return await generateAITripPlan({
        prompt: prompt.trim(),
        targetBudget: Number(targetBudget) || 35000,
        durationDays: Number(durationDays) || 5,
      });
    },
    onSuccess: (plan) => {
      setGeneratedPlan(plan);
      toast.success("AI Trip Plan generated! Review your itinerary below.");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate plan"
      );
    },
  });

  // Commit mutation
  const handleCommitTrip = async () => {
    if (!generatedPlan) return;
    if (!user) {
      toast.info("Please log in to save your trip.");
      navigate("/login");
      return;
    }

    setIsCommitting(true);
    try {
      const tripId = await commitAITripPlan(generatedPlan, user.id);
      toast.success("Trip created and ready in your itinerary builder!");
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      onOpenChange(false);
      navigate(`/trips/${tripId}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save generated trip"
      );
    } finally {
      setIsCommitting(false);
    }
  };

  const handleReset = () => {
    setGeneratedPlan(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-surface-900 via-surface-950 to-primary-950 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-400/20 p-2.5 text-amber-300 ring-1 ring-amber-400/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-white font-[var(--font-display)]">
                  Plan with Gemini AI
                </DialogTitle>
                <p className="text-xs text-surface-300">
                  Natural-language trip synthesis validated with real database catalogs
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-amber-400/40 bg-amber-400/10 text-amber-300 text-xs py-1"
            >
              Gemini 2.5 Flash
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {!generatedPlan ? (
            /* Input Form */
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="ai-prompt" className="text-xs font-bold">
                  What kind of journey are you envisioning?
                </Label>
                <Textarea
                  id="ai-prompt"
                  rows={3}
                  placeholder="e.g. Plan a 5-day cultural trip to Rajasthan with a ₹35,000 budget. We love palaces, photography, and delicious local food without rushing."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-white dark:bg-surface-900"
                />
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider block">
                  Quick Ideas
                </span>
                <div className="flex flex-col gap-1.5">
                  {PRESET_PROMPTS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(preset)}
                      className="text-left text-xs rounded-xl border border-surface-200 dark:border-surface-800 p-2.5 bg-white dark:bg-surface-900/60 hover:border-primary-500/40 hover:bg-primary-500/5 transition-all text-surface-700 dark:text-surface-300"
                    >
                      "{preset}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Constraints Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-surface-200 dark:border-surface-800">
                <div className="space-y-1.5">
                  <Label htmlFor="ai-budget" className="text-xs font-semibold">
                    Target Budget (₹)
                  </Label>
                  <Input
                    id="ai-budget"
                    type="number"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(e.target.value)}
                    placeholder="35000"
                    className="bg-white dark:bg-surface-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ai-duration" className="text-xs font-semibold">
                    Duration (Days)
                  </Label>
                  <Input
                    id="ai-duration"
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    placeholder="5"
                    min="1"
                    max="21"
                    className="bg-white dark:bg-surface-900"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <Button
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending || !prompt.trim()}
                  className="w-full gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold py-5 shadow-lg"
                >
                  {generateMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating Itinerary with Gemini...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Custom Plan
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Preview Plan State */
            <div className="space-y-6 animate-fade-in">
              {/* Plan Overview Card */}
              <div className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-5 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100 font-[var(--font-display)]">
                    {generatedPlan.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary-600 text-white text-xs capitalize">
                      {generatedPlan.recommendedTravelStyle} Style
                    </Badge>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
                  {generatedPlan.summary}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-surface-600 dark:text-surface-400 pt-2 border-t border-surface-100 dark:border-surface-800">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary-500" />
                    <span>
                      {formatDateRange(
                        generatedPlan.startDate,
                        generatedPlan.endDate
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Receipt className="h-4 w-4 text-emerald-500" />
                    <span>
                      Est. Total: {formatCurrency(generatedPlan.estimatedTotalCost)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-amber-500" />
                    <span>{generatedPlan.stops.length} Cities</span>
                  </div>
                </div>
              </div>

              {/* Day-by-Day Schedule Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500 flex items-center gap-2">
                  <Compass className="h-4 w-4 text-primary-500" />
                  Generated Daily Schedule
                </h4>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {generatedPlan.stops.map((stop, sIdx) => (
                    <Card
                      key={sIdx}
                      className="border-surface-200 dark:border-surface-800 shadow-none bg-surface-50/60 dark:bg-surface-900/40"
                    >
                      <CardHeader className="py-2.5 px-4 bg-surface-100/60 dark:bg-surface-800/40 border-b border-surface-200/60 dark:border-surface-800 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                            {sIdx + 1}
                          </span>
                          <CardTitle className="text-sm font-bold">
                            {stop.city.name} ({stop.stayDays} Days)
                          </CardTitle>
                        </div>
                        {stop.reasoning && (
                          <span className="text-[11px] text-surface-500 italic max-w-xs truncate">
                            {stop.reasoning}
                          </span>
                        )}
                      </CardHeader>

                      <CardContent className="p-3 space-y-2">
                        {stop.days.map((day) => (
                          <div
                            key={day.dayNumber}
                            className="rounded-xl bg-white dark:bg-surface-900 p-3 border border-surface-200/80 dark:border-surface-800 text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-surface-800 dark:text-surface-200">
                              <span>Day {day.dayNumber}</span>
                              {day.theme && (
                                <span className="text-primary-600 dark:text-primary-400 font-medium">
                                  {day.theme}
                                </span>
                              )}
                            </div>

                            <div className="divide-y divide-surface-100 dark:divide-surface-800">
                              {day.activities.map((act, aIdx) => (
                                <div
                                  key={aIdx}
                                  className="py-1.5 flex items-center justify-between text-xs"
                                >
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-surface-900 dark:text-surface-100">
                                        {act.title}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-[9px] py-0 px-1.5"
                                      >
                                        {act.category}
                                      </Badge>
                                    </div>
                                    {act.scheduledTime && (
                                      <span className="text-[10px] text-surface-400 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {act.scheduledTime} ({act.durationHours} hrs)
                                      </span>
                                    )}
                                  </div>

                                  <span className="font-bold text-surface-800 dark:text-surface-200">
                                    {act.estimatedCost === 0
                                      ? "Free"
                                      : formatCurrency(act.estimatedCost)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-surface-200 dark:border-surface-800">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isCommitting}
                  className="text-xs font-semibold"
                >
                  Back to Prompt
                </Button>

                <Button
                  onClick={handleCommitTrip}
                  disabled={isCommitting}
                  className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-6 shadow-md"
                >
                  {isCommitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Creating Itinerary in Supabase...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Confirm & Create Trip
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
