import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTrip, updateTrip } from "@/services/data/trips";
import { createExpense, deleteExpense } from "@/services/data/expenses";
import { calculateTripBudget } from "../engine/calculator";
import type { TripBudgetCalculation } from "../types";
import type { ExpenseInsert } from "@/types/database";

export function useTripBudget(tripId: string) {
  const queryClient = useQueryClient();

  const {
    data: trip,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["trip", tripId, "budget-view"],
    queryFn: async () => {
      if (!tripId) return null;
      return await getTrip(tripId);
    },
    enabled: !!tripId,
  });

  const budget = useMemo<TripBudgetCalculation | null>(() => {
    if (!trip) return null;
    return calculateTripBudget(trip);
  }, [trip]);

  // Mutation to update target budget
  const updateBudgetMutation = useMutation({
    mutationFn: async (newTargetBudget: number) => {
      if (!tripId) throw new Error("Trip ID missing");
      return await updateTrip(tripId, { target_budget: newTargetBudget });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  // Mutation to add manual expense
  const addExpenseMutation = useMutation({
    mutationFn: async (expense: Omit<ExpenseInsert, "trip_id">) => {
      if (!tripId) throw new Error("Trip ID missing");
      return await createExpense({
        ...expense,
        trip_id: tripId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
    },
  });

  // Mutation to delete an expense
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      return await deleteExpense(expenseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
    },
  });

  return {
    trip,
    budget,
    isLoading,
    isError,
    error,
    refetch,
    updateBudget: updateBudgetMutation.mutateAsync,
    isUpdatingBudget: updateBudgetMutation.isPending,
    addExpense: addExpenseMutation.mutateAsync,
    isAddingExpense: addExpenseMutation.isPending,
    deleteExpense: deleteExpenseMutation.mutateAsync,
    isDeletingExpense: deleteExpenseMutation.isPending,
  };
}
