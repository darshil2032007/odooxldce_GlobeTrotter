import { useState } from "react";
import { Plus, Trash2, Receipt, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import type { Expense, ExpenseInsert } from "@/types/database";

interface ExpenseTrackerProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<ExpenseInsert, "trip_id">) => Promise<unknown>;
  onDeleteExpense: (expenseId: string) => Promise<unknown>;
  isAdding?: boolean;
}

const EXPENSE_CATEGORIES = [
  "Accommodation",
  "Transport",
  "Food",
  "Activities",
  "Shopping",
  "Other",
];

export function ExpenseTracker({
  expenses,
  onAddExpense,
  onDeleteExpense,
  isAdding,
}: ExpenseTrackerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Accommodation");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    await onAddExpense({
      amount: numAmount,
      category,
      description: description.trim() || undefined,
      date: date || undefined,
      currency: "INR",
    });

    setAmount("");
    setDescription("");
    setIsOpen(false);
  };

  return (
    <Card className="shadow-card border-surface-200 dark:border-surface-800">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary-500" />
            Standalone Expenses
          </CardTitle>
          <p className="text-xs text-surface-500">
            Log custom expenses like flights, hotel bookings, dining & cabs
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsOpen(true)}
          className="gap-1.5 text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Expense
        </Button>
      </CardHeader>

      <CardContent>
        {expenses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-200 dark:border-surface-800 p-6 text-center text-xs text-surface-400">
            No standalone expenses logged yet. Activity costs from your itinerary
            are automatically calculated above.
          </div>
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-800/60 max-h-60 overflow-y-auto pr-1">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between py-2.5 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-surface-900 dark:text-surface-100">
                      {exp.description || exp.category}
                    </span>
                    <span className="rounded-full bg-surface-100 dark:bg-surface-800 px-2 py-0.5 text-[10px] font-medium text-surface-500">
                      {exp.category}
                    </span>
                  </div>
                  {exp.date && (
                    <p className="flex items-center gap-1 text-[11px] text-surface-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(exp.date).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-surface-900 dark:text-surface-100">
                    {formatCurrency(exp.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteExpense(exp.id)}
                    className="h-7 w-7 p-0 text-surface-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary-500" />
                Add New Expense
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="exp-amount">Amount (₹)</Label>
                <Input
                  id="exp-amount"
                  type="number"
                  placeholder="e.g. 2500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  step="any"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exp-cat">Category</Label>
                <select
                  id="exp-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exp-desc">Description (Optional)</Label>
                <Input
                  id="exp-desc"
                  placeholder="e.g. Hotel Grand Stay, Train Tickets"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exp-date">Date</Label>
                <Input
                  id="exp-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isAdding || !amount}>
                  {isAdding ? "Adding..." : "Save Expense"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
