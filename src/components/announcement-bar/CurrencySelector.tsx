"use client";

import { Globe } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { CURRENCIES } from "@/src/lib/i18n";
import type { Currency } from "@/src/lib/i18n";

interface CurrencySelectorProps {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

const currencyOptions: Currency[] = ["USD", "INR", "AED", "EUR", "GBP"];

export const CurrencySelector = ({
  currency,
  onCurrencyChange,
}: CurrencySelectorProps) => {
  const currentCurrencyData = CURRENCIES[currency];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 xs:h-7 sm:h-8 px-1.5 xs:px-2 sm:px-3 text-xs xs:text-sm sm:text-xs font-normal text-[#FEFEFE]/90 hover:text-[#FEFEFE] hover:bg-[#FEFEFE]/10 whitespace-nowrap"
          style={{ fontFamily: "var(--font-sans)" }}
          aria-label="Select currency"
        >
          <Globe className="mr-0.5 xs:mr-1 h-2.5 xs:h-3 w-2.5 xs:w-3 flex-shrink-0" />
          <span className="hidden sm:inline text-xs xs:text-sm">{currentCurrencyData.symbol}</span>
          <span className="sm:hidden text-xs xs:text-sm">{currency}</span>
          <span className="ml-0.5 xs:ml-1 hidden sm:inline text-xs xs:text-sm">{currency}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 sm:w-52 z-50">
        {currencyOptions.map((curr) => {
          const currData = CURRENCIES[curr];
          return (
            <DropdownMenuItem
              key={curr}
              onClick={() => onCurrencyChange(curr)}
              className={`cursor-pointer py-2 px-3 text-sm ${currency === curr ? "bg-accent font-semibold" : ""}`}
            >
              <span className="mr-2 font-medium">{currData.symbol}</span>
              <span className="flex-1">{currData.name}</span>
              {currency === curr && (
                <span className="ml-2 text-xs">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
