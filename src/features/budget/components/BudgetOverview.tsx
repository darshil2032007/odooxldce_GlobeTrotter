import { useState } from "react";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { useTripBudget } from "../hooks/useTripBudget";
import { BudgetSummaryCard } from "./BudgetSummaryCard";
import { OverBudgetAlert } from "./OverBudgetAlert";
import { CategoryPieChart } from "./CategoryPieChart";
import { DailyCostBarChart } from "./DailyCostBarChart";
import { CategoryBreakdownList } from "./CategoryBreakdownList";
import { ExpenseTracker } from "./ExpenseTracker";
import { SmartBudgetAssistantModal } from "@/features/assistant/components/SmartBudgetAssistantModal";
import { toast } from "sonner";

interface BudgetOverviewProps {
  tripId: string;
}

export function BudgetOverview({ tripId }: BudgetOverviewProps) {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const {
    trip,
    budget,
    isLoading,
    isError,
    refetch,
    updateBudget,
    addExpense,
    deleteExpense,
    isAddingExpense,
  } = useTripBudget(tripId);

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !trip || !budget) {
    return (
      <ErrorState
        title="Failed to load budget"
        message="Could not calculate trip expenses and budget metrics."
        onRetry={refetch}
      />
    );
  }

  const handleUpdateBudget = async (newTarget: number) => {
    try {
      await updateBudget(newTarget);
      toast.success("Target budget updated successfully");
    } catch {
      toast.error("Failed to update target budget");
    }
  };

  const handleAddExpense = async (exp: Parameters<typeof addExpense>[0]) => {
    try {
      await addExpense(exp);
      toast.success("Expense recorded");
    } catch {
      toast.error("Failed to record expense");
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      toast.success("Expense removed");
    } catch {
      toast.error("Failed to remove expense");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Over-budget alert banner */}
      <OverBudgetAlert
        budget={budget}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* Main Budget Summary Card */}
      <BudgetSummaryCard
        budget={budget}
        onUpdateBudget={handleUpdateBudget}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* Charts Grid: Pie Chart + Daily Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart
          categories={budget.categoryBreakdown}
          totalCost={budget.total}
        />
        <DailyCostBarChart
          days={budget.dailyBreakdown}
          dailyBudget={budget.dailyBudget}
        />
      </div>

      {/* Detailed Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdownList
          categories={budget.categoryBreakdown}
          totalCost={budget.total}
        />
        <ExpenseTracker
          expenses={trip.expenses || []}
          onAddExpense={handleAddExpense}
          onDeleteExpense={handleDeleteExpense}
          isAdding={isAddingExpense}
        />
      </div>

      {/* Smart Budget Assistant Modal */}
      {isAssistantOpen && (
        <SmartBudgetAssistantModal
          open={isAssistantOpen}
          onOpenChange={setIsAssistantOpen}
          trip={trip}
          budget={budget}
          onApplied={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
}
