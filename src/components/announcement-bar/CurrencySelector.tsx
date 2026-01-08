"use client";

import { Globe } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

interface CurrencySelectorProps {
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "EUR", symbol: "€", name: "Euro" },
];

export const CurrencySelector = ({
  currency,
  onCurrencyChange,
}: CurrencySelectorProps) => {
  const currentCurrency = currencies.find((c) => c.code === currency) || currencies[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 xs:h-7 sm:h-8 px-1.5 xs:px-2 sm:px-3 text-[9px] xs:text-[10px] sm:text-xs font-normal text-[#FEFEFE]/90 hover:text-[#FEFEFE] hover:bg-[#FEFEFE]/10 whitespace-nowrap"
          style={{ fontFamily: "var(--font-sans)" }}
          aria-label="Select currency"
        >
          <Globe className="mr-0.5 xs:mr-1 h-2.5 xs:h-3 w-2.5 xs:w-3 flex-shrink-0" />
          <span className="hidden sm:inline text-[10px] xs:text-xs">{currentCurrency.symbol}</span>
          <span className="sm:hidden text-[8px] xs:text-[9px]">{currentCurrency.code}</span>
          <span className="ml-0.5 xs:ml-1 hidden sm:inline text-[10px] xs:text-xs">{currentCurrency.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 sm:w-52 z-50">
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => onCurrencyChange(curr.code)}
            className={`cursor-pointer py-2 px-3 text-sm ${currency === curr.code ? "bg-accent font-semibold" : ""}`}
          >
            <span className="mr-2 font-medium">{curr.symbol}</span>
            <span className="flex-1">{curr.name}</span>
            {currency === curr.code && (
              <span className="ml-2 text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
