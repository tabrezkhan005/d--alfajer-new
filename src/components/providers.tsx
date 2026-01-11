"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import { Toaster } from "@/src/components/ui/sonner";
import { CartProvider } from "@/src/lib/cart-store";
import { WishlistProvider } from "@/src/lib/wishlist-store";
import { OrdersProvider } from "@/src/lib/orders-store";
import { SettingsProvider } from "@/src/lib/settings-store";
import { I18nProvider } from "@/src/components/providers/i18n-provider";
import { AuthProvider } from "@/src/lib/auth-context";

export const Providers = ({ children, ...props }: ThemeProviderProps) => {
  const CartProviderComponent = CartProvider as React.ComponentType<{ children: React.ReactNode }>;
  const WishlistProviderComponent = WishlistProvider as React.ComponentType<{ children: React.ReactNode }>;
  const OrdersProviderComponent = OrdersProvider as React.ComponentType<{ children: React.ReactNode }>;
  const SettingsProviderComponent = SettingsProvider as React.ComponentType<{ children: React.ReactNode }>;
  const I18nProviderComponent = I18nProvider as React.ComponentType<{ children: React.ReactNode }>;
  const AuthProviderComponent = AuthProvider as React.ComponentType<{ children: React.ReactNode }>;
  return (
    <NextThemesProvider {...props}>
      <I18nProviderComponent>
        <AuthProviderComponent>
          <CartProviderComponent>
            <WishlistProviderComponent>
              <OrdersProviderComponent>
                <SettingsProviderComponent>
                  {children}
                  <Toaster />
                </SettingsProviderComponent>
              </OrdersProviderComponent>
            </WishlistProviderComponent>
          </CartProviderComponent>
        </AuthProviderComponent>
      </I18nProviderComponent>
    </NextThemesProvider>
  );
};
