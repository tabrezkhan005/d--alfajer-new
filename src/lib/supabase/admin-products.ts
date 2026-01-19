"use client";

import { createClient } from "./client";
import type { Database } from "./database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
type ProductVariantInsert = Database["public"]["Tables"]["product_variants"]["Insert"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

export interface AdminProductWithVariants extends Product {
    variants: ProductVariant[];
    category: Category | null;
}

// Get all products for admin (including inactive)
export async function getAdminProducts(): Promise<AdminProductWithVariants[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("products")
        .select(`
            *,
            variants:product_variants(*),
            category:categories(*)
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching admin products:", error);
        throw error;
    }

    return (data || []) as AdminProductWithVariants[];
}

// Get single product by ID for admin
export async function getAdminProductById(id: string): Promise<AdminProductWithVariants | null> {
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
        console.error("Error fetching product:", error);
        return null;
    }

    return data as AdminProductWithVariants;
}

// Create a new product
export async function createProduct(productData: {
    name: string;
    slug: string;
    short_description?: string;
    long_description?: string;
    category_id?: string;
    base_price: number;
    original_price?: number;
    origin?: string;
    certifications?: string[];
    allergen_info?: string[];
    ingredients?: string[];
    nutrition_facts?: Record<string, unknown>;
    is_active?: boolean;
    is_on_sale?: boolean;
    badge?: string;
    images?: string[];
}): Promise<Product> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("products")
        .insert({
            name: productData.name,
            slug: productData.slug,
            short_description: productData.short_description || "",
            long_description: productData.long_description || "",
            category_id: productData.category_id || null,
            base_price: productData.base_price,
            original_price: productData.original_price || productData.base_price,
            origin: productData.origin || null,
            certifications: productData.certifications || [],
            allergen_info: productData.allergen_info || [],
            ingredients: productData.ingredients || [],
            nutrition_facts: productData.nutrition_facts || {},
            is_active: productData.is_active ?? true,
            is_on_sale: productData.is_on_sale ?? false,
            badge: productData.badge || null,
            images: productData.images || [],
            rating: 0,
            reviews_count: 0,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating product:", error);
        throw error;
    }

    return data;
}

// Update an existing product
export async function updateProduct(
    id: string,
    productData: Partial<{
        name: string;
        slug: string;
        short_description: string;
        long_description: string;
        category_id: string | null;
        base_price: number;
        original_price: number;
        origin: string;
        certifications: string[];
        allergen_info: string[];
        ingredients: string[];
        nutrition_facts: Record<string, unknown>;
        is_active: boolean;
        is_on_sale: boolean;
        badge: string | null;
        images: string[];
    }>
): Promise<Product> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("products")
        .update({
            ...productData,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating product:", error);
        throw error;
    }

    return data;
}

// Delete a product
export async function deleteProduct(id: string): Promise<void> {
    const supabase = createClient();

    // First delete associated variants
    const { error: variantsError } = await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", id);

    if (variantsError) {
        console.error("Error deleting product variants:", variantsError);
        throw variantsError;
    }

    // Then delete the product
    const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
}

// Create a product variant
export async function createProductVariant(variantData: {
    product_id: string;
    sku: string;
    weight: string;
    price: number;
    compare_at_price?: number;
    stock_quantity: number;
}): Promise<ProductVariant> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("product_variants")
        .insert(variantData)
        .select()
        .single();

    if (error) {
        console.error("Error creating variant:", error);
        throw error;
    }

    return data;
}

// Update a product variant
export async function updateProductVariant(
    id: string,
    variantData: Partial<ProductVariantInsert>
): Promise<ProductVariant> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("product_variants")
        .update(variantData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating variant:", error);
        throw error;
    }

    return data;
}

// Delete a product variant
export async function deleteProductVariant(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        .from("product_variants")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting variant:", error);
        throw error;
    }
}

// Upload product image to Supabase storage
export async function uploadProductImage(
    productId: string,
    file: File
): Promise<string> {
    const supabase = createClient();

    const fileExt = file.name.split(".").pop();
    const fileName = `products/${productId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (uploadError) {
        console.error("Error uploading image:", uploadError);
        throw uploadError;
    }

    const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

    return data.publicUrl;
}

// Delete product image from storage
export async function deleteProductImage(imageUrl: string): Promise<void> {
    const supabase = createClient();

    // Extract the path from the URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/");
    const bucketIndex = pathParts.indexOf("product-images");
    if (bucketIndex === -1) return;

    const filePath = pathParts.slice(bucketIndex + 1).join("/");

    const { error } = await supabase.storage
        .from("product-images")
        .remove([filePath]);

    if (error) {
        console.error("Error deleting image:", error);
        throw error;
    }
}

// Get all categories
export async function getAdminCategories(): Promise<Category[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }

    return data || [];
}
