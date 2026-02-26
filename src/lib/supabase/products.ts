"use client";

import { createClient } from "./client";
import type { Database } from "./database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

export interface ProductWithVariants extends Product {
    variants: ProductVariant[];
    category: Category | null;
}

// Get all products with variants and category
export async function getProducts(options?: {
    categorySlug?: string;
    limit?: number;
    offset?: number;
    sortBy?: "name" | "price" | "created_at";
    sortOrder?: "asc" | "desc";
}): Promise<ProductWithVariants[]> {
    const supabase = createClient();

    let query = supabase
        .from("products")
        .select(`
      *,
      variants:product_variants(*),
      category:categories(*)
    `)
        .eq("is_active", true);

    if (options?.categorySlug) {
        // Get category ID first
        const { data: category } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", options.categorySlug)
            .single();

        if (category) {
            query = query.eq("category_id", category.id);
        }
    }

    if (options?.sortBy) {
        const column = options.sortBy === "price" ? "base_price" : options.sortBy;
        query = query.order(column, { ascending: options.sortOrder === "asc" });
    } else {
        query = query.order("created_at", { ascending: false });
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching products:", error.message, error.details, error.hint);
        return [];
    }

    const products = (data || []) as ProductWithVariants[];

    // Ensure images are public URLs (convert storage paths to public URLs)
    const mapped = products.map((p) => {
        const images = Array.isArray(p.images)
            ? p.images
                .map((img: string) => {
                    if (!img) return null;
                    if (typeof img === "string" && (img.startsWith("http://") || img.startsWith("https://"))) {
                        return img;
                    }
                    try {
                        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(img);
                        return publicUrl;
                    } catch (e) {
                        return null;
                    }
                })
                .filter((x): x is string => Boolean(x))
            : [];

        return { ...p, images };
    });

    return mapped;
}

// Get single product by slug
export async function getProductBySlug(slug: string): Promise<ProductWithVariants | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("products")
        .select(`
      *,
      variants:product_variants(*),
      category:categories(*)
    `)
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

    if (error) {
        console.error("Error fetching product by slug:", error.message, error.details, error.hint);
        return null;
    }

    const product = data as ProductWithVariants;
    if (product) {
        const images = Array.isArray(product.images)
            ? product.images
                .map((img: string) => {
                    if (!img) return null;
                    if (typeof img === "string" && (img.startsWith("http://") || img.startsWith("https://"))) {
                        return img;
                    }
                    try {
                        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(img);
                        return publicUrl;
                    } catch (e) {
                        return null;
                    }
                })
                .filter((x): x is string => Boolean(x))
            : [];
        return { ...product, images } as ProductWithVariants;
    }
    return null;
}

// Get product by ID
export async function getProductById(id: string): Promise<ProductWithVariants | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("products")
        .select(`
      *,
      variants:product_variants(*),
      category:categories(*)
    `)
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching product by id:", error.message, error.details, error.hint);
        return null;
    }

    const product = data as ProductWithVariants;
    if (product) {
        const images = Array.isArray(product.images)
            ? product.images
                .map((img: string) => {
                    if (!img) return null;
                    if (typeof img === "string" && (img.startsWith("http://") || img.startsWith("https://"))) {
                        return img;
                    }
                    try {
                        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(img);
                        return publicUrl;
                    } catch (e) {
                        return null;
                    }
                })
                .filter((x): x is string => Boolean(x))
            : [];
        return { ...product, images } as ProductWithVariants;
    }
    return null;
}

// Search products
// Search products with filters
export async function searchProducts(
    query: string,
    filters?: {
        priceRange?: [number, number];
        categories?: string[];
        origins?: string[];
        certifications?: string[];
        inStockOnly?: boolean;
        onSaleOnly?: boolean;
        sortBy?: string;
    }
): Promise<ProductWithVariants[]> {
    const supabase = createClient();

    let dbQuery = supabase
        .from("products")
        .select(`
          *,
          variants:product_variants(*),
          category:categories(*)
        `)
        .eq("is_active", true);

    // Filter by text query
    if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,ingredients.ilike.%${query}%`);
    }

    // Filter by Category
    if (filters?.categories && filters.categories.length > 0) {
        // We need to fetch category IDs for these slugs/names
        // This is tricky in one query if we only have names.
        // Assuming filters.categories passes names, we'd need a join filter.
        // Supabase postgrest-js complex filtering:
        // .filter('category.name', 'in', `(${filters.categories.join(',')})`)
        // NOTE: The UI passes category NAMES (e.g. "Spices").
        // We should really pass slugs, but sticking to UI convention:
        // Let's filter on the joined category table.
        // However, Supabase select with nested filter is weird.
        // Easier approach: Get products and filter in memory if result set is small?
        // OR: Use inner join syntax: !inner
        // dbQuery = dbQuery.select('..., category!inner(name)')

        // Let's try to map names to IDs first? No, easier to rely on UI passing valid data.
        // But UI sends "Spices".
        // Let's assume we filter client side for complex relations OR update UI to send slugs.
        // User wants "100% functionality".
        // Robust way:
        // Do nothing here for complex relation filters if we can't easily do it without changing UI drastically.
        // BUT, price range is easy.
    }

    // Price Range
    if (filters?.priceRange) {
        dbQuery = dbQuery.gte('base_price', filters.priceRange[0]).lte('base_price', filters.priceRange[1]);
    }

    // Origin
    if (filters?.origins && filters.origins.length > 0) {
        // origins is text column in products
        dbQuery = dbQuery.in('origin', filters.origins);
    }

    // Certifications
    if (filters?.certifications && filters.certifications.length > 0) {
        // certifications is array column (text[])
        // Postgres: certifications && ARRAY['Organic']
        dbQuery = dbQuery.contains('certifications', filters.certifications);
    }

    // In Stock
    if (filters?.inStockOnly) {
        // Check if ANY variant has stock > 0?
        // Or check a product-level flag?
        // Our schema doesn't have product-level stock. It uses variants.
        // This is hard to filter in one query without a computed column.
        // We will filter this in memory (returned data includes variants).
    }

    // On Sale
    if (filters?.onSaleOnly) {
        dbQuery = dbQuery.eq('badge', 'SALE');
    }

    // Sorting
    if (filters?.sortBy) {
        if (filters.sortBy === 'price-low') {
            dbQuery = dbQuery.order('base_price', { ascending: true });
        } else if (filters.sortBy === 'price-high') {
            dbQuery = dbQuery.order('base_price', { ascending: false });
        } else if (filters.sortBy === 'rating') {
            dbQuery = dbQuery.order('rating', { ascending: false });
        } else {
            // Featured/Default
            dbQuery = dbQuery.order('created_at', { ascending: false });
        }
    }

    // Execute query
    const { data, error } = await dbQuery;

    if (error) {
        console.error("Error searching products:", error.message, error.details, error.hint);
        return [];
    }

    let results = (data || []) as ProductWithVariants[];

    // In-Memory filtering for complex relations (Category, Stock)
    if (filters?.categories && filters.categories.length > 0) {
        results = results.filter(p => p.category && filters.categories?.includes(p.category.name));
    }

    if (filters?.inStockOnly) {
        results = results.filter(p => p.variants.some(v => (v.stock_quantity || 0) > 0));
    }

    // Ensure images are public URLs (convert storage paths to public URLs)
    const mapped = results.map((p) => {
        const images = Array.isArray(p.images)
            ? p.images
                .map((img: string) => {
                    if (!img) return null;
                    if (typeof img === "string" && (img.startsWith("http://") || img.startsWith("https://"))) {
                        return img;
                    }
                    try {
                        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(img);
                        return publicUrl;
                    } catch (e) {
                        return null;
                    }
                })
                .filter((x): x is string => Boolean(x))
            : [];

        return { ...p, images };
    });

    return mapped;
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }

    return data || [];
}

// Get category by slug
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
        console.error("Error fetching category:", error);
        return null;
    }

    return data;
}

// Get featured/best-selling products
export async function getFeaturedProducts(limit: number = 8): Promise<ProductWithVariants[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("products")
        .select(`
      *,
      variants:product_variants(*),
      category:categories(*)
    `)
        .eq("is_active", true)
        .order("review_count", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching featured products:", error.message, error.details, error.hint);
        return [];
    }

    return (data || []) as ProductWithVariants[];
}

// Get products on sale
export async function getSaleProducts(limit: number = 8): Promise<ProductWithVariants[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("products")
        .select(`
      *,
      variants:product_variants(*),
      category:categories(*)
    `)
        .eq("is_active", true)
        .eq("badge", "SALE")
        .limit(limit);

    if (error) {
        console.error("Error fetching sale products:", error.message, error.details, error.hint);
        return [];
    }

    return (data || []) as ProductWithVariants[];
}
