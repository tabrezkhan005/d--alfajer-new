"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export interface WishlistItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  getTotalItems: () => number;
  clearWishlist: () => void;
  toggleWishlist: (item: WishlistItem) => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = 'al-fajr-wishlist';

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
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

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
    }
  }, [items, isHydrated]);

  const addItem = useCallback((item: WishlistItem) => {
    setItems((current) => {
      const exists = current.find((i) => i.id === item.id);
      if (exists) return current;
      return [...current, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((i) => i.id !== id));
  }, []);

  const isInWishlist = useCallback((id: string) => {
    return items.some((i) => i.id === id);
  }, [items]);

  const getTotalItems = useCallback(() => {
    return items.length;
  }, [items]);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const toggleWishlist = useCallback((item: WishlistItem) => {
    setItems((current) => {
      const exists = current.find((i) => i.id === item.id);
      if (exists) {
        return current.filter((i) => i.id !== item.id);
      }
      return [...current, item];
    });
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        getTotalItems,
        clearWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlistStore = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlistStore must be used within WishlistProvider');
  }
  return context;
};
