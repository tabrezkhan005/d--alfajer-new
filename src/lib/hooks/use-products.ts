"use client";

import { useState, useEffect } from "react";
import { getProducts, getCategories, searchProducts, getFeaturedProducts } from "@/src/lib/supabase/products";
import type { ProductWithVariants } from "@/src/lib/supabase/products";
import type { Database } from "@/src/lib/supabase/database.types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

// Transform database product to frontend Product format
export function transformProduct(dbProduct: ProductWithVariants) {
    const primaryVariant = dbProduct.variants?.[0];
    // Filter out empty strings and null/undefined values from images
    const rawImages = dbProduct.images || [];
    const images = Array.isArray(rawImages)
        ? rawImages.filter((img: string) => img && img.trim() !== "")
        : [];
    const mainImage = images.length > 0 ? images[0] : "/images/placeholder.jpg";

    return {
        id: dbProduct.id,
        name: dbProduct.name,
        slug: dbProduct.slug,
        image: mainImage,
        images: images.length > 0 ? images : ["/images/placeholder.jpg"],
        price: primaryVariant?.price || dbProduct.base_price || 0,
        originalPrice: primaryVariant?.compare_at_price || dbProduct.original_price || undefined,
        discount: primaryVariant?.compare_at_price
            ? Math.round(((primaryVariant.compare_at_price - primaryVariant.price) / primaryVariant.compare_at_price) * 100)
            : undefined,
        rating: dbProduct.rating || 0,
        reviews: dbProduct.review_count || 0,
        packageSize: primaryVariant?.weight || "N/A",
        origin: dbProduct.origin || "Unknown",
        description: (dbProduct as any).short_description || "",
        longDescription: (dbProduct as any).long_description || "",
        certifications: dbProduct.certifications || [],
        inStock: (primaryVariant?.stock_quantity || 0) > 0,
        onSale: !!dbProduct.badge && dbProduct.badge === "SALE",
        badge: dbProduct.badge as "SALE" | "HOT" | "NEW" | undefined,
        category: dbProduct.category,
        variants: dbProduct.variants?.map(v => ({
            id: v.id,
            weight: v.weight,
            size: v.weight,
            price: v.price,
            originalPrice: v.compare_at_price || undefined,
            stock: v.stock_quantity || 0,
            sku: v.sku,
        })) || [],
        nutritionFacts: dbProduct.nutrition_facts as {
            servingSize: string;
            calories: number;
            protein: string;
            fat: string;
            carbs: string;
            fiber: string;
        } | null,
        // Normalize ingredients: accept string (comma-separated) or array from DB
        ingredients: (() => {
            const ingredientsRaw = dbProduct.ingredients;
            if (Array.isArray(ingredientsRaw)) {
                return ingredientsRaw.map((i: unknown) => String(i).trim()).filter(Boolean);
            }
            if (typeof ingredientsRaw === "string" && ingredientsRaw.length > 0) {
                return ingredientsRaw.split(",").map(i => i.trim()).filter(Boolean);
            }
            return [];
        })(),
        // Normalize allergen info: accept string (comma-separated) or array from DB
        allergenInfo: (() => {
            const allergenRaw = dbProduct.allergen_info;
            if (Array.isArray(allergenRaw)) {
                return allergenRaw.map((a: unknown) => String(a).trim()).filter(Boolean);
            }
            if (typeof allergenRaw === "string" && allergenRaw.length > 0) {
                return allergenRaw.split(",").map(a => a.trim()).filter(Boolean);
            }
            return [];
        })(),
    };
}

export type TransformedProduct = ReturnType<typeof transformProduct>;

// Hook for fetching products
export function useProducts(options?: {
    categorySlug?: string;
    limit?: number;
}) {
    const [products, setProducts] = useState<TransformedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);
                const data = await getProducts(options);
                setProducts(data.map(transformProduct));
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load products");
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [options?.categorySlug, options?.limit]);

    return { products, loading, error };
}

// Hook for fetching featured products
export function useFeaturedProducts(limit: number = 8) {
    const [products, setProducts] = useState<TransformedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);
                const data = await getFeaturedProducts(limit);
                setProducts(data.map(transformProduct));
            } catch (err) {
                console.error("Error fetching featured products:", err);
                setError("Failed to load products");
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [limit]);

    return { products, loading, error };
}

// Hook for fetching categories
export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCategories() {
            try {
                setLoading(true);
                const data = await getCategories();
                setCategories(data);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError("Failed to load categories");
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, []);

    return { categories, loading, error };
}

// Hook for search
export function useProductSearch(query: string) {
    const [products, setProducts] = useState<TransformedProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!query || query.length < 2) {
            setProducts([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                setLoading(true);
                const data = await searchProducts(query);
                setProducts(data.map(transformProduct));
            } catch (err) {
                console.error("Error searching products:", err);
                setError("Failed to search products");
            } finally {
                setLoading(false);
            }
        }, 300); // Debounce

        return () => clearTimeout(timeoutId);
    }, [query]);

    return { products, loading, error };
}
