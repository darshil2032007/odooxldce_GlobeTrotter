import { supabase } from "@/lib/supabase";
import type {
  Expense,
  ExpenseInsert,
  ExpenseUpdate,
  ExpenseFilters,
} from "@/types/database";

/**
 * Fetch all expenses for a specific trip with optional category / stop filters.
 */
export async function getExpenses(
  tripId: string,
  filters?: ExpenseFilters
): Promise<Expense[]> {
  let query = supabase
    .from("expenses")
    .select("*")
    .eq("trip_id", tripId)
    .order("date", { ascending: false, nullsFirst: false });

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.stopId) {
    query = query.eq("stop_id", filters.stopId);
  }

  if (filters?.startDate) {
    query = query.gte("date", filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte("date", filters.endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Create a new expense.
 */
export async function createExpense(expenseData: ExpenseInsert): Promise<Expense> {
  const { data, error } = await supabase
    .from("expenses")
    .insert(expenseData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing expense.
 */
export async function updateExpense(
  id: string,
  updates: ExpenseUpdate
): Promise<Expense> {
  const { data, error } = await supabase
    .from("expenses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete an expense by ID.
 */
export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Calculate total budget, total spent, remaining balance, and breakdown by category.
 */
export async function getTripBudgetSummary(tripId: string): Promise<{
  targetBudget: number;
  totalSpent: number;
  remainingBudget: number;
  spentByCategory: Record<string, number>;
}> {
  // Fetch trip budget
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("target_budget")
    .eq("id", tripId)
    .single();

  if (tripError) throw tripError;

  // Fetch all expenses
  const { data: expenses, error: expError } = await supabase
    .from("expenses")
    .select("amount, category")
    .eq("trip_id", tripId);

  if (expError) throw expError;

  const targetBudget = Number(trip?.target_budget || 0);
  let totalSpent = 0;
  const spentByCategory: Record<string, number> = {};

  (expenses || []).forEach((e) => {
    const amt = Number(e.amount || 0);
    totalSpent += amt;
    spentByCategory[e.category] = (spentByCategory[e.category] || 0) + amt;
  });

  return {
    targetBudget,
    totalSpent,
    remainingBudget: Math.max(0, targetBudget - totalSpent),
    spentByCategory,
  };
}
