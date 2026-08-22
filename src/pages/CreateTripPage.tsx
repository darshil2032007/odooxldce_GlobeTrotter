import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Compass, Calendar as CalendarIcon, DollarSign, Image as ImageIcon, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useCreateTrip } from "@/hooks/useTrips";
import { AITripGeneratorModal } from "@/components/ai/AITripGeneratorModal";
import { toast } from "sonner";

export function CreateTripPage() {
  const navigate = useNavigate();
  const createTripMutation = useCreateTrip();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [targetBudget, setTargetBudget] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Trip name is required";
    } else if (name.length < 3) {
      newErrors.name = "Trip name must be at least 3 characters";
    }

    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!endDate) {
      newErrors.endDate = "End date is required";
    } else if (startDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = "End date cannot be before start date";
    }

    if (!targetBudget) {
      newErrors.targetBudget = "Target budget is required";
    } else if (Number(targetBudget) <= 0) {
      newErrors.targetBudget = "Budget must be greater than $0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix form errors before submitting");
      return;
    }

    createTripMutation.mutate(
      {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        targetBudget: Number(targetBudget),
        coverImage: coverImage.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          toast.success("Trip created successfully!");
          navigate(`/trips/${data.id}`);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to create trip");
        },
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="gap-1 text-surface-500">
          <Link to="/trips">
            <ArrowLeft className="h-4 w-4" />
            Back to My Trips
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Plan a New Trip"
        description="Fill out the basic details below or let Gemini AI craft a personalized multi-city itinerary for you."
      />

      {/* Plan with AI Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary-500/30 bg-gradient-to-r from-primary-950/40 via-surface-900/90 to-indigo-950/40 p-5 shadow-lg backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-amber-400/20 p-2.5 text-amber-300 ring-1 ring-amber-400/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Plan with Gemini AI
              </h3>
              <p className="text-xs text-surface-300 mt-0.5 max-w-md">
                Describe your dream vacation in plain words. AI will synthesize stops, daily schedules, and estimated costs matched to verified destinations.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setIsAIModalOpen(true)}
            className="w-full sm:w-auto shrink-0 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-surface-950 font-bold shadow-md hover:shadow-orange-500/20"
          >
            <Sparkles className="h-4 w-4" />
            ✨ Plan with AI
          </Button>
        </div>
      </div>

      <AITripGeneratorModal
        open={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
      />

      <form onSubmit={handleSubmit}>
        <Card className="shadow-card">
          <CardHeader className="border-b border-surface-100 bg-surface-50/50">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary-500" />
              <span>Trip Details</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Trip Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="required">
                Trip Name <span className="text-danger-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Summer European Adventure, Tokyo & Kyoto Express"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={errors.name ? "border-danger-500 focus:ring-danger-500/20" : ""}
              />
              {errors.name && <p className="text-xs text-danger-500">{errors.name}</p>}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-danger-500">*</span>
                </Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (errors.startDate) setErrors((prev) => ({ ...prev, startDate: "" }));
                    }}
                    className={`pl-9 ${errors.startDate ? "border-danger-500" : ""}`}
                  />
                </div>
                {errors.startDate && (
                  <p className="text-xs text-danger-500">{errors.startDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">
                  End Date <span className="text-danger-500">*</span>
                </Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: "" }));
                    }}
                    className={`pl-9 ${errors.endDate ? "border-danger-500" : ""}`}
                  />
                </div>
                {errors.endDate && <p className="text-xs text-danger-500">{errors.endDate}</p>}
              </div>
            </div>

            {/* Target Budget */}
            <div className="space-y-2">
              <Label htmlFor="targetBudget">
                Target Budget (USD) <span className="text-danger-500">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                <Input
                  id="targetBudget"
                  type="number"
                  placeholder="3500"
                  value={targetBudget}
                  onChange={(e) => {
                    setTargetBudget(e.target.value);
                    if (errors.targetBudget) setErrors((prev) => ({ ...prev, targetBudget: "" }));
                  }}
                  className={`pl-9 ${errors.targetBudget ? "border-danger-500" : ""}`}
                  min="1"
                />
              </div>
              {errors.targetBudget && (
                <p className="text-xs text-danger-500">{errors.targetBudget}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Trip Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add notes about your trip goals, must-see landmarks, travel style..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Cover Image URL */}
            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image URL (Optional)</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                <Input
                  id="coverImage"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-surface-400">
                Paste an image link to personalize your trip card.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-surface-100 bg-surface-50/50 p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/trips")}
              disabled={createTripMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={createTripMutation.isPending}
              className="gap-2 shadow-md"
            >
              <Sparkles className="h-4 w-4" />
              {createTripMutation.isPending ? "Creating Trip..." : "Create Trip"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
