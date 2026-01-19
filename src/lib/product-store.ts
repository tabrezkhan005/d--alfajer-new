"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Product type for local storage (legacy support - no longer used for main product management)
export interface LocalProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  image: string;
  images: string[];
  videos?: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  packageSize: string;
  origin: string;
  certifications: string[];
  inStock: boolean;
  onSale: boolean;
  badge?: "SALE" | "HOT" | "NEW";
  categoryId?: string;
  categoryName?: string;
  sku?: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  weight: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
}

interface ProductStore {
  products: LocalProduct[];
  variants: ProductVariant[];

  // Product CRUD (legacy - kept for backward compatibility)
  addProduct: (product: Omit<LocalProduct, "id" | "createdAt" | "updatedAt">) => LocalProduct;
  updateProduct: (id: string, updates: Partial<LocalProduct>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => LocalProduct | undefined;
  getProductBySlug: (slug: string) => LocalProduct | undefined;

  // Variant CRUD
  addVariant: (variant: Omit<ProductVariant, "id">) => ProductVariant;
  updateVariant: (id: string, updates: Partial<ProductVariant>) => void;
  deleteVariant: (id: string) => void;
  getVariantsByProductId: (productId: string) => ProductVariant[];

  // Utilities
  getAllProducts: () => LocalProduct[];
  getActiveProducts: () => LocalProduct[];
}

function generateId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],
      variants: [],

      addProduct: (productData) => {
        const newProduct: LocalProduct = {
          ...productData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          products: [...state.products, newProduct],
        }));

        return newProduct;
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          variants: state.variants.filter((v) => v.productId !== id),
        }));
      },

      getProduct: (id) => {
        return get().products.find((p) => p.id === id);
      },

      getProductBySlug: (slug) => {
        return get().products.find((p) => p.slug === slug);
      },

      addVariant: (variantData) => {
        const newVariant: ProductVariant = {
          ...variantData,
          id: generateId(),
        };

        set((state) => ({
          variants: [...state.variants, newVariant],
        }));

        return newVariant;
      },

      updateVariant: (id, updates) => {
        set((state) => ({
          variants: state.variants.map((v) =>
            v.id === id ? { ...v, ...updates } : v
          ),
        }));
      },

      deleteVariant: (id) => {
        set((state) => ({
          variants: state.variants.filter((v) => v.id !== id),
        }));
      },

      getVariantsByProductId: (productId) => {
        return get().variants.filter((v) => v.productId === productId);
      },

      getAllProducts: () => {
        return get().products;
      },

      getActiveProducts: () => {
        return get().products.filter((p) => p.isActive);
      },
    }),
    {
      name: "alfajer-products-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// No more static mock products - all products are now managed in Supabase database
// This file is kept for legacy local storage support if needed
