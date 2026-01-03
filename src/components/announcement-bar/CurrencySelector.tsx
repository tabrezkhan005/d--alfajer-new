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
          className="h-7 px-2 text-xs font-normal text-[#FEFEFE]/90 hover:text-[#FEFEFE] hover:bg-[#FEFEFE]/10"
          style={{ fontFamily: "var(--font-sans)" }}
          aria-label="Select currency"
        >
          <Globe className="mr-1.5 h-3 w-3" />
          <span className="hidden sm:inline">{currentCurrency.symbol}</span>
          <span className="sm:hidden">{currentCurrency.code}</span>
          <span className="ml-1 hidden sm:inline">{currentCurrency.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => onCurrencyChange(curr.code)}
            className={currency === curr.code ? "bg-accent" : ""}
          >
            <span className="mr-2">{curr.symbol}</span>
            <span>{curr.name}</span>
            {currency === curr.code && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
