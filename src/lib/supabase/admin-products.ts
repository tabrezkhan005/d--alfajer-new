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

    // Convert arrays to comma-separated strings for text columns
    const ingredientsText = productData.ingredients?.join(', ') || null;
    const allergenInfoText = productData.allergen_info?.join(', ') || null;

    const { data, error } = await supabase
        .from("products")
        .insert({
            name: productData.name,
            slug: productData.slug,
            description: productData.short_description || "",
            long_description: productData.long_description || "",
            category_id: productData.category_id || null,
            base_price: productData.base_price,
            original_price: productData.original_price || productData.base_price,
            origin: productData.origin || null,
            certifications: productData.certifications || [],
            allergen_info: allergenInfoText,
            ingredients: ingredientsText,
            nutrition_facts: productData.nutrition_facts || {},
            is_active: productData.is_active ?? true,
            badge: productData.badge || null,
            images: productData.images || [],
            rating: 0,
            review_count: 0,
        } as any)
        .select()
        .single();

    if (error) {
        console.error("Error creating product:", JSON.stringify(error, null, 2));
        throw new Error(error.message || "Failed to create product");
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

    // Build the update object with correct column names
    const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (productData.name !== undefined) updateData.name = productData.name;
    if (productData.slug !== undefined) updateData.slug = productData.slug;
    if (productData.short_description !== undefined) updateData.description = productData.short_description;
    if (productData.long_description !== undefined) updateData.long_description = productData.long_description;
    if (productData.category_id !== undefined) updateData.category_id = productData.category_id;
    if (productData.base_price !== undefined) updateData.base_price = productData.base_price;
    if (productData.original_price !== undefined) updateData.original_price = productData.original_price;
    if (productData.origin !== undefined) updateData.origin = productData.origin;
    if (productData.certifications !== undefined) updateData.certifications = productData.certifications;
    if (productData.allergen_info !== undefined) updateData.allergen_info = productData.allergen_info.join(', ');
    if (productData.ingredients !== undefined) updateData.ingredients = productData.ingredients.join(', ');
    if (productData.nutrition_facts !== undefined) updateData.nutrition_facts = productData.nutrition_facts;
    if (productData.is_active !== undefined) updateData.is_active = productData.is_active;
    if (productData.badge !== undefined) updateData.badge = productData.badge;
    if (productData.images !== undefined) updateData.images = productData.images;

    const { data, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating product:", JSON.stringify(error, null, 2));
        throw new Error(error.message || "Failed to update product");
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

// Get all variants for a product
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .order("price", { ascending: true });

    if (error) {
        console.error("Error fetching variants:", error);
        throw error;
    }

    return data || [];
}

// Bulk update or create variants for a product
export async function updateOrCreateVariants(
    productId: string,
    variants: Array<{
        id?: string;
        sku: string;
        size: string;
        weight: string;
        display_name: string;
        price: number;
        original_price?: number;
        stock_quantity: number;
        is_default?: boolean;
    }>
): Promise<ProductVariant[]> {
    const supabase = createClient();
    const results: ProductVariant[] = [];

    for (const variant of variants) {
        // Prepare common data object
        const variantData = {
            sku: variant.sku,
            size: variant.size,
            weight: variant.weight,
            display_name: variant.display_name,
            price: variant.price,
            original_price: variant.original_price === undefined ? null : variant.original_price,
            stock_quantity: variant.stock_quantity,
            is_default: variant.is_default ?? false,
            updated_at: new Date().toISOString(),
        };

        if (variant.id) {
            // Update existing variant by ID
            const { data, error } = await supabase
                .from("product_variants")
                .update(variantData)
                .eq("id", variant.id)
                .select();

            if (error) {
                console.error("Error updating variant by ID:", JSON.stringify(error, null, 2));
                throw error;
            }

            if (data && data.length > 0) {
                results.push(data[0]);
                continue;
            } else {
                 console.warn(`Variant with ID ${variant.id} not found, falling back to create/upsert.`);
                 // Fall through to create logic below
            }
        }

        // Create logic (or fallback from update)
        // First, check if a variant with this SKU already exists
        if (variant.sku) {
             const { data: existingVariant } = await supabase
                .from("product_variants")
                .select("id")
                .eq("sku", variant.sku)
                .maybeSingle();

             if (existingVariant) {
                 // Update the existing variant using its ID
                 const { data: updatedData, error: updateError } = await supabase
                    .from("product_variants")
                    .update({
                        ...variantData,
                        product_id: productId // Ensure ownership
                    })
                    .eq("id", existingVariant.id)
                    .select()
                    .single();

                 if (updateError) {
                     console.error("Error updating existing variant by SKU:", JSON.stringify(updateError, null, 2));
                     throw updateError;
                 }
                 results.push(updatedData);
                 continue;
             }
        }

        // If no existing variant with this SKU, insert new one
        const { data: newData, error: insertError } = await supabase
            .from("product_variants")
            .insert({
                product_id: productId,
                ...variantData
            })
            .select()
            .single();

        if (insertError) {
             console.error("Error creating variant:", JSON.stringify(insertError, null, 2));
             throw insertError;
        }
        results.push(newData);
    }

    return results;
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

// Create a new category
export async function createCategory(categoryData: {
    name: string;
    description?: string;
}): Promise<Category> {
    const supabase = createClient();

    // Generate slug from name
    const slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const { data, error } = await supabase
        .from("categories")
        .insert({
            name: categoryData.name,
            slug: slug,
            description: categoryData.description || null,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating category:", error);
        throw error;
    }

    return data;
}
