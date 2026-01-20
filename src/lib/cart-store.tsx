"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export interface CartItem {
  id: string; // Unique ID (e.g. productId-variantId)
  productId?: string;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  packageSize: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }, openCart?: boolean) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string, variantId?: string) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'al-fajr-cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setItems(parsed.items || []);
      } catch {
        setItems([]);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
    }
  }, [items, isHydrated]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }, shouldOpenCart = true) => {
    setItems((current) => {
      const existingItem = current.find((i) => i.id === item.id);
      const qtyToAdd = item.quantity || 1;
      if (existingItem) {
        return current.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + qtyToAdd } : i
        );
      }
      return [...current, { ...item, quantity: qtyToAdd }];
    });
    if (shouldOpenCart) {
      setIsOpen(true);
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((current) => current.filter((i) => i.id !== id));
      return;
    }
    setItems((current) =>
      current.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  const isInCart = useCallback((productId: string, variantId?: string) => {
    return items.some(item => {
        if (variantId) {
            return item.variantId === variantId || item.id.includes(variantId);
        }
        // If no variantId specified, checks if ANY variant of product is in cart
        return item.productId === productId || item.id.startsWith(productId);
    });
  }, [items]);

  const value: CartContextType = {
    items,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export function useCartStore() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartStore must be used within a CartProvider');
  }
  return context;
}
