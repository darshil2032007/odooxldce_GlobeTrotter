import { Coins, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCurrency,
  type CurrencyCode,
} from "@/context/CurrencyContext";

const CURRENCY_OPTIONS: { code: CurrencyCode; label: string; flag: string }[] = [
  { code: "INR", label: "INR (₹) - Indian Rupee", flag: "🇮🇳" },
  { code: "USD", label: "USD ($) - US Dollar", flag: "🇺🇸" },
  { code: "EUR", label: "EUR (€) - Euro", flag: "🇪🇺" },
  { code: "GBP", label: "GBP (£) - British Pound", flag: "🇬🇧" },
  { code: "JPY", label: "JPY (¥) - Japanese Yen", flag: "🇯🇵" },
  { code: "AED", label: "AED (د.إ) - UAE Dirham", flag: "🇦🇪" },
  { code: "AUD", label: "AUD (A$) - Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", label: "CAD (C$) - Canadian Dollar", flag: "🇨🇦" },
];

export function CurrencySwitcher() {
  const { currency, setCurrency, config } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 px-2.5 rounded-xl text-xs font-bold border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 text-surface-700 dark:text-surface-200 hover:bg-surface-100"
        >
          <Coins className="h-3.5 w-3.5 text-amber-500" />
          <span>
            {config.code} ({config.symbol})
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 p-1 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 shadow-xl"
      >
        <DropdownMenuLabel className="text-[11px] font-bold text-surface-400 uppercase tracking-wider px-2 py-1.5">
          Display Currency
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {CURRENCY_OPTIONS.map((opt) => {
          const isSelected = opt.code === currency;
          return (
            <DropdownMenuItem
              key={opt.code}
              onClick={() => setCurrency(opt.code)}
              className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg cursor-pointer ${
                isSelected
                  ? "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold"
                  : "text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{opt.flag}</span>
                <span>{opt.label}</span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary-600" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
