// Order and Checkout types

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  isAvailable: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet' | 'apple_pay' | 'google_pay';
  name: string;
  isAvailable: boolean;
  requiresTokenization: boolean;
}

export interface OrderLineItem {
  productId: string;
  variantId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  email: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  lineItems: OrderLineItem[];
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  promoCode?: string;
  giftMessage?: string;
  subscription?: {
    enabled: boolean;
    frequency: 'weekly' | 'monthly';
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
}

export interface Checkout {
  shippingAddress: Partial<ShippingAddress>;
  billingAddress?: Partial<ShippingAddress>;
  shippingMethodId?: string;
  paymentMethodId?: string;
  promoCode?: string;
  giftMessage?: string;
  subscription?: {
    enabled: boolean;
    frequency: 'weekly' | 'monthly';
  };
  useBillingAddress: boolean;
}

// Shipping methods
export const shippingMethods: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: '5-7 business days',
    price: 0,
    estimatedDays: 6,
    isAvailable: true,
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: '2-3 business days',
    price: 10,
    estimatedDays: 2,
    isAvailable: true,
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Next business day',
    price: 25,
    estimatedDays: 1,
    isAvailable: true,
  },
];

// Payment methods
export const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    type: 'card',
    name: 'Credit/Debit Card',
    isAvailable: true,
    requiresTokenization: true,
  },
  {
    id: 'upi',
    type: 'upi',
    name: 'UPI (India)',
    isAvailable: true,
    requiresTokenization: false,
  },
  {
    id: 'wallet',
    type: 'wallet',
    name: 'Digital Wallet',
    isAvailable: true,
    requiresTokenization: true,
  },
  {
    id: 'apple_pay',
    type: 'apple_pay',
    name: 'Apple Pay',
    isAvailable: true,
    requiresTokenization: true,
  },
  {
    id: 'google_pay',
    type: 'google_pay',
    name: 'Google Pay',
    isAvailable: true,
    requiresTokenization: true,
  },
];

import { createClient } from '@/src/lib/supabase/client';

export async function validatePromoCode(code: string): Promise<{ valid: boolean; discount?: number; type?: 'percentage' | 'fixed' }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return { valid: false };
  }

  // Check Expiry
  if (data.end_date && new Date(data.end_date) < new Date()) {
    return { valid: false };
  }

  // Check Usage Limit
  if (data.usage_limit && (data.usage_count || 0) >= data.usage_limit) {
    return { valid: false };
  }

  return {
    valid: true,
    discount: data.discount_value,
    type: data.discount_type as 'percentage' | 'fixed'
  };
}

export function calculateTax(subtotal: number, country: string): number {
  // Simplified tax calculation
  const taxRate: Record<string, number> = {
    'US': 0.08,
    'GB': 0.20,
    'IN': 0.05,
    'AE': 0,
    'EU': 0.19,
  };
  const rate = taxRate[country] || 0.05;
  return Math.round(subtotal * rate * 100) / 100;
}

export function calculateShippingByRegion(country: string, weight: number): number {
  // Simplified shipping calculation based on country and weight
  const baseRate: Record<string, number> = {
    'IN': 50,
    'US': 10,
    'GB': 8,
    'AE': 5,
    'EU': 7,
  };
  const base = baseRate[country] || 10;
  const weightCharge = Math.ceil((weight / 500) * 5);
  return base + weightCharge;
}
