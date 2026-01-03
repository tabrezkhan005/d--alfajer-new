"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import { Toaster } from "@/src/components/ui/sonner";
import { CartProvider } from "@/src/lib/cart-store";

export const Providers = ({ children, ...props }: ThemeProviderProps) => {
  const CartProviderComponent = CartProvider as React.ComponentType<{ children: React.ReactNode }>;
  return (
    <NextThemesProvider {...props}>
      <CartProviderComponent>
        {children}
        <Toaster />
      </CartProviderComponent>
    </NextThemesProvider>
  );
};
