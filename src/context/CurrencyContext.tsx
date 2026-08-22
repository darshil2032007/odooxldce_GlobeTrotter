import React, { createContext, useContext, useState, useEffect } from "react";

export type CurrencyCode =
  | "INR"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "AED"
  | "AUD"
  | "CAD";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateFromINR: number; // Conversion rate relative to INR baseline (1 INR = X currency)
  rateFromUSD: number; // Conversion rate relative to USD baseline
  locale: string;
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    rateFromINR: 1.0,
    rateFromUSD: 86.5,
    locale: "en-IN",
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    rateFromINR: 1 / 86.5,
    rateFromUSD: 1.0,
    locale: "en-US",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    rateFromINR: 0.92 / 86.5,
    rateFromUSD: 0.92,
    locale: "de-DE",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    rateFromINR: 0.79 / 86.5,
    rateFromUSD: 0.79,
    locale: "en-GB",
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    rateFromINR: 154.0 / 86.5,
    rateFromUSD: 154.0,
    locale: "ja-JP",
  },
  AED: {
    code: "AED",
    symbol: "AED",
    name: "UAE Dirham",
    rateFromINR: 3.67 / 86.5,
    rateFromUSD: 3.67,
    locale: "ar-AE",
  },
  AUD: {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    rateFromINR: 1.55 / 86.5,
    rateFromUSD: 1.55,
    locale: "en-AU",
  },
  CAD: {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    rateFromINR: 1.39 / 86.5,
    rateFromUSD: 1.39,
    locale: "en-CA",
  },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatAmount: (amount: number, overrideCode?: CurrencyCode) => string;
  config: CurrencyConfig;
}

const STORAGE_KEY = "globetrotter_active_currency";

export const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode;
    return saved && CURRENCY_CONFIGS[saved] ? saved : "INR";
  });

  const setCurrency = (code: CurrencyCode) => {
    if (!CURRENCY_CONFIGS[code]) return;
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
    // Dispatch window event so utility formatters outside React tree also react
    window.dispatchEvent(
      new CustomEvent("globetrotter_currency_changed", { detail: code })
    );
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const nextCode = e.newValue as CurrencyCode;
        if (CURRENCY_CONFIGS[nextCode]) {
          setCurrencyState(nextCode);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const config = CURRENCY_CONFIGS[currency];

  const formatAmount = (amount: number, overrideCode?: CurrencyCode): string => {
    const targetCode = overrideCode || currency;
    const targetConfig = CURRENCY_CONFIGS[targetCode] || config;

    // Database amounts are stored in INR (or USD baseline)
    // If amount is in INR: convert using rateFromINR
    const converted = amount * targetConfig.rateFromINR;

    return new Intl.NumberFormat(targetConfig.locale, {
      style: "currency",
      currency: targetConfig.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatAmount,
        config,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback for components outside provider
    const fallbackCurrency = (localStorage.getItem(STORAGE_KEY) as CurrencyCode) || "INR";
    const cfg = CURRENCY_CONFIGS[fallbackCurrency] || CURRENCY_CONFIGS.INR;
    return {
      currency: fallbackCurrency,
      setCurrency: (code) => {
        localStorage.setItem(STORAGE_KEY, code);
        window.dispatchEvent(new CustomEvent("globetrotter_currency_changed", { detail: code }));
      },
      formatAmount: (amount) => {
        return new Intl.NumberFormat(cfg.locale, {
          style: "currency",
          currency: cfg.code,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount * cfg.rateFromINR);
      },
      config: cfg,
    };
  }
  return context;
}
