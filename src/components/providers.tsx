"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { Toaster } from "@/src/components/ui/sonner";
import { CartProvider } from "@/src/lib/cart-store.tsx";

export const Providers = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <NextThemesProvider {...props}>
      <CartProvider>
        {children}
        <Toaster />
      </CartProvider>
    </NextThemesProvider>
  );
};
