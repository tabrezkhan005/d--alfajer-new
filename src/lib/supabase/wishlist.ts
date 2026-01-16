"use client";

import { createClient } from "./client";
import type { Database } from "./database.types";

type Wishlist = Database["public"]["Tables"]["wishlists"]["Row"];

export interface WishlistWithProduct extends Wishlist {
    product: {
        id: string;
        name: string;
        slug: string;
        images: string[] | null;
        base_price: number | null;
        original_price: number | null;
        rating: number | null;
        review_count: number | null;
    } | null;
}

// Get wishlist items for a customer
export async function getWishlist(customerId: string): Promise<WishlistWithProduct[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("wishlists")
        .select(`
      *,
      product:products(id, name, slug, images, base_price, original_price, rating, review_count)
    `)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching wishlist:", error);
        return [];
    }

    return (data || []) as WishlistWithProduct[];
}

// Add item to wishlist
export async function addToWishlist(
    customerId: string,
    productId: string
): Promise<boolean> {
    const supabase = createClient();

    // Check if already in wishlist
    const { data: existing } = await supabase
        .from("wishlists")
        .select("id")
        .eq("customer_id", customerId)
        .eq("product_id", productId)
        .single();

    if (existing) {
        return true; // Already in wishlist
    }

    const { error } = await supabase
        .from("wishlists")
        .insert({
            customer_id: customerId,
            product_id: productId,
        });

    if (error) {
        console.error("Error adding to wishlist:", error);
        return false;
    }

    return true;
}

// Remove item from wishlist
export async function removeFromWishlist(
    customerId: string,
    productId: string
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("customer_id", customerId)
        .eq("product_id", productId);

    if (error) {
        console.error("Error removing from wishlist:", error);
        return false;
    }

    return true;
}

// Check if product is in wishlist
export async function isInWishlist(
    customerId: string,
    productId: string
): Promise<boolean> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("wishlists")
        .select("id")
        .eq("customer_id", customerId)
        .eq("product_id", productId)
        .single();

    if (error || !data) {
        return false;
    }

    return true;
}

// Sync local wishlist to database (for when user logs in)
export async function syncWishlist(
    customerId: string,
    localProductIds: string[]
): Promise<void> {
    const supabase = createClient();

    // Get existing wishlist
    const { data: existing } = await supabase
        .from("wishlists")
        .select("product_id")
        .eq("customer_id", customerId);

    const existingIds = new Set(existing?.map(w => w.product_id) || []);

    // Add items that are in local but not in database
    const toAdd = localProductIds.filter(id => !existingIds.has(id));

    if (toAdd.length > 0) {
        await supabase
            .from("wishlists")
            .insert(toAdd.map(product_id => ({
                customer_id: customerId,
                product_id,
            })));
    }
}
