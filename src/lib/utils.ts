import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { type CurrencyCode, CURRENCY_CONFIGS } from "@/context/CurrencyContext";

export function formatCurrency(amount: number, overrideCurrency?: string): string {
  const activeCode: CurrencyCode =
    (overrideCurrency as CurrencyCode) ||
    (localStorage.getItem("globetrotter_active_currency") as CurrencyCode) ||
    "INR";

  const cfg = CURRENCY_CONFIGS[activeCode] || CURRENCY_CONFIGS.INR;
  const converted = (amount || 0) * cfg.rateFromINR;

  return new Intl.NumberFormat(cfg.locale, {
    style: "currency",
    currency: cfg.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(converted);
}

export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  if (startDate.getFullYear() !== endDate.getFullYear()) {
    return `${startDate.toLocaleDateString("en-US", { ...options, year: "numeric" })} — ${endDate.toLocaleDateString("en-US", { ...options, year: "numeric" })}`;
  }

  return `${startDate.toLocaleDateString("en-US", options)} — ${endDate.toLocaleDateString("en-US", { ...options, year: "numeric" })}`;
}

export function getDaysUntil(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getTripDuration(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
