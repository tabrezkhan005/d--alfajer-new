"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export interface Order {
  id: string;
  date: string;
  items: string;
  total: string;
  status: "Delivered" | "Shipped" | "Processing";
  userId: string;
}

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'userId'>, userId: string) => void;
  getOrdersByUser: (userId: string) => Order[];
  removeOrder: (id: string) => void;
}

const OrdersContext = createContext<OrdersContextType | null>(null);

const STORAGE_KEY = 'al-fajr-orders';

export const OrdersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setOrders(parsed.orders || []);
      } catch {
        setOrders([]);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever orders change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ orders }));
    }
  }, [orders, isHydrated]);

  const addOrder = useCallback((order: Omit<Order, 'id' | 'userId'>, userId: string) => {
    const newOrder: Order = {
      ...order,
      id: 'ORD-' + Date.now(),
      userId,
    };
    setOrders((current) => [...current, newOrder]);
  }, []);

  const getOrdersByUser = useCallback((userId: string) => {
    return orders.filter((order) => order.userId === userId);
  }, [orders]);

  const removeOrder = useCallback((id: string) => {
    setOrders((current) => current.filter((order) => order.id !== id));
  }, []);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addOrder,
        getOrdersByUser,
        removeOrder,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === null) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}
