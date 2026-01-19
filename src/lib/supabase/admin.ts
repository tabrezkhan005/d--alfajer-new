"use client";

import { createClient } from "./client";
import type { Database } from "./database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

// Create a new product (admin)
export async function createProduct(product: {
    name: string;
    slug: string;
    description?: string;
    long_description?: string;
    category_id?: string;
    base_price: number;
    original_price?: number;
    images?: string[];
    origin?: string;
    certifications?: string[];
    allergen_info?: string;
    ingredients?: string;
    nutrition_facts?: Record<string, unknown>;
    badge?: "SALE" | "HOT" | "NEW";
    is_active?: boolean;
}): Promise<Product | null> {
    const supabase = createClient();

    const { description, ingredients, allergen_info, ...rest } = product;

    const { data, error } = await supabase
        .from("products")
        .insert({
            ...rest,
            short_description: description || '',
            long_description: product.long_description || description || '', // Populate long_description
            ingredients: ingredients ? ingredients.split(',').map(s => s.trim()) : [],
            allergen_info: allergen_info ? allergen_info.split(',').map(s => s.trim()) : [],
            is_active: product.is_active ?? true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as any)
        .select()
        .single();

    if (error) {
        console.error("Error creating product:", JSON.stringify(error, null, 2)); // improved logging
        return null;
    }

    return data;
}

// Update a product (admin)
export async function updateProduct(
    productId: string,
    updates: any
): Promise<boolean> {
    const supabase = createClient();

    const { description, ingredients, allergen_info, ...rest } = updates;

    const dbUpdates: any = { ...rest };

    if (description !== undefined) dbUpdates.short_description = description;
    if (ingredients !== undefined) {
        dbUpdates.ingredients = typeof ingredients === 'string'
            ? ingredients.split(',').map((s: string) => s.trim())
            : ingredients;
    }
    if (allergen_info !== undefined) {
        dbUpdates.allergen_info = typeof allergen_info === 'string'
            ? allergen_info.split(',').map((s: string) => s.trim())
            : allergen_info;
    }

    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
        .from("products")
        .update(dbUpdates)
        .eq("id", productId);

    if (error) {
        console.error("Error updating product:", error);
        return false;
    }

    return true;
}

// Delete a product (admin)
export async function deleteProduct(productId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

    if (error) {
        console.error("Error deleting product:", error);
        return false;
    }

    return true;
}

// Create a product variant (admin)
export async function createVariant(variant: {
    product_id: string;
    sku: string;
    weight: string;
    price: number;
    compare_at_price?: number;
    stock_quantity?: number;
    size?: string;
}): Promise<ProductVariant | null> {
    const supabase = createClient();

    const { compare_at_price, stock_quantity, size, ...rest } = variant;

    const { data, error } = await supabase
        .from("product_variants")
        .insert({
            ...rest,
            original_price: compare_at_price,
            stock: stock_quantity,
            size: size || 'Standard',
        } as any)
        .select()
        .single();

    if (error) {
        console.error("Error creating variant:", JSON.stringify(error, null, 2));
        return null;
    }

    return data;
}

// Update a variant (admin)
export async function updateVariant(
    variantId: string,
    updates: Partial<ProductVariant>
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("product_variants")
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq("id", variantId);

    if (error) {
        console.error("Error updating variant:", error);
        return false;
    }

    return true;
}

// Delete a variant (admin)
export async function deleteVariant(variantId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("product_variants")
        .delete()
        .eq("id", variantId);

    if (error) {
        console.error("Error deleting variant:", error);
        return false;
    }

    return true;
}

// Update stock quantity (admin)
export async function updateStock(
    variantId: string,
    quantity: number
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("product_variants")
        .update({ stock_quantity: quantity })
        .eq("id", variantId);

    if (error) {
        console.error("Error updating stock:", error);
        return false;
    }

    return true;
}

// Get all products for admin (includes inactive)
export async function getAdminProducts(): Promise<(Product & { variants: ProductVariant[] })[]> {
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
        return [];
    }

    // Normalize image paths to public URLs (handles both stored paths and already public URLs)
    const products = (data || []) as (Product & { variants: ProductVariant[] })[];
    const mapped = products.map((p) => {
        const imgs = Array.isArray(p.images)
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
                  .filter(Boolean)
            : [];

        return {
            ...p,
            images: imgs,
        } as Product & { variants: ProductVariant[] };
    });

    return mapped;
}

// Category management (admin)
export async function createCategory(category: {
    name: string;
    slug: string;
    description?: string | null;
    image_url?: string | null;
    parent_id?: string | null;
}): Promise<Database["public"]["Tables"]["categories"]["Row"] | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("categories")
        .insert({
            ...category,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating category:", error);
        return null;
    }
    return data;
}

export async function updateCategory(categoryId: string, updates: Partial<Database["public"]["Tables"]["categories"]["Update"]>): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from("categories")
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq("id", categoryId);

    if (error) {
        console.error("Error updating category:", error);
        return false;
    }
    return true;
}

export async function deleteCategory(categoryId: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

    if (error) {
        console.error("Error deleting category:", error);
        return false;
    }
    return true;
}

// Upload product image to storage
export async function uploadProductImage(
    file: File,
    productId: string
): Promise<string | null> {
    const supabase = createClient();

    const fileExt = file.name.split(".").pop();
    const fileName = `${productId}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

    if (error) {
        console.error("Error uploading image:", error);
        return null;
    }

    const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

    return publicUrl;
}

// Delete product image from storage
export async function deleteProductImage(imageUrl: string): Promise<boolean> {
    const supabase = createClient();

    // Extract file path from URL
    const urlParts = imageUrl.split("/product-images/");
    if (urlParts.length < 2) return false;

    const filePath = urlParts[1];

    const { error } = await supabase.storage
        .from("product-images")
        .remove([filePath]);

    if (error) {
        console.error("Error deleting image:", error);
        return false;
    }

    return true;
}

// Get admin dashboard stats
export async function getDashboardStats() {
    const supabase = createClient();

    // Parallel fetch for speed
    const [
        { count: orderCount, error: orderError },
        { data: revenueData, error: revenueError },
        { count: productsCount, error: productsError },
        { count: customersCount, error: customersError },
        { data: recentOrders, error: recentOrdersError },
        { data: lowStockProducts, error: lowStockError }
    ] = await Promise.all([
        // Total orders
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        // Revenue (sum total)
        supabase.from('orders').select('total').neq('status', 'cancelled'),
        // Active products
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        // Total customers
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        // Recent orders
        supabase.from('orders')
            .select(`
                id,
                user_id,
                total,
                status,
                created_at,
                email
            `)
            .order('created_at', { ascending: false })
            .limit(5),
        // Low stock products (less than 10) - use 'stock' column which is the actual DB column
        supabase.from('product_variants')
            .select('product_id, stock, products(id, name, slug)')
            .lt('stock', 10)
            .limit(5)
    ]);

    // Calculate total revenue
    const totalRevenue = (revenueData as any[])?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

    // Calculate growth (mock logic for now as we don't have historical data easily accessible without complex queries)
    const stats = {
        totalRevenue: { value: totalRevenue, change: 0 },
        totalOrders: { value: orderCount || 0, change: 0 },
        activeProducts: { value: productsCount || 0, change: 0 },
        activeCustomers: { value: customersCount || 0, change: 0 },
        recentOrders: recentOrders || [],
        lowStockProducts: (lowStockProducts as any[])?.map(p => ({
            id: p.product_id,
            name: p.products?.name,
            slug: p.products?.slug,
            stock: p.stock
        })) || []
    };

    return stats;
}

// Get sales chart data (last 7 days)
export async function getSalesChartData() {
    const supabase = createClient();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: orders } = await supabase
        .from('orders')
        .select('created_at, total')
        .gte('created_at', sevenDaysAgo.toISOString())
        .neq('status', 'cancelled')
        .order('created_at');

    // Group by day
    const chartData: Record<string, number> = {};
    (orders as any[])?.forEach(order => {
        if (!order.created_at) return;
        const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        chartData[date] = (chartData[date] || 0) + (order.total || 0);
    });

    return Object.entries(chartData).map(([date, amount]) => ({ name: date, total: amount }));
}

// --- Categories ---
export async function getAdminCategories() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data;
}

// --- Customers ---
export async function getCustomers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
  return data;
}

// --- Coupons ---
export async function getCoupons() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
  return data;
}

export async function createCoupon(coupon: any) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("coupons")
    .insert({
        ...coupon,
        created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating coupon:", error);
    return null;
  }
  return data;
}

export async function updateCoupon(id: string, updates: any) {
  const supabase = createClient();
  const { error } = await supabase
    .from("coupons")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error updating coupon:", error);
    return false;
  }
  return true;
}

export async function deleteCoupon(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("coupons")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting coupon:", error);
    return false;
  }
  return true;
}

// --- Banners ---
export async function getBanners() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("display_order");

  if (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
  return data;
}

export async function createBanner(banner: any) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("banners")
    .insert({
        ...banner,
        updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating banner:", error);
    return null;
  }
  return data;
}

export async function updateBanner(id: string, updates: any) {
  const supabase = createClient();
  const { error } = await supabase
    .from("banners")
    .update({
        ...updates,
        updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating banner:", error);
    return false;
  }
  return true;
}

export async function deleteBanner(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("banners")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting banner:", error);
    return false;
  }
  return true;
}

export async function uploadBannerImage(file: File): Promise<string | null> {
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `banners/${Date.now()}.${fileExt}`;

    // Using product-images bucket effectively as a general media bucket
    const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

    if (error) {
        console.error("Error uploading banner image:", error);
        return null;
    }

    const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

    return publicUrl;
}


// --- Announcements ---
export async function getAnnouncements() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
  return data.map((item: any) => ({ ...item, content: item.message }));
}

export async function createAnnouncement(announcement: any) {
  const supabase = createClient();

  const payload = {
      message: announcement.content,
      link_url: announcement.link_url || null,
      start_date: announcement.start_date || null,
      end_date: announcement.end_date || null,
      is_active: announcement.is_active,
      updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("announcements")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error creating announcement:", error);
    return null;
  }
  return { ...data, content: data.message };
}

export async function updateAnnouncement(id: string, updates: any) {
  const supabase = createClient();

  const payload: any = {
      updated_at: new Date().toISOString()
  };

  if (updates.content !== undefined) payload.message = updates.content;
  if (updates.link_url !== undefined) payload.link_url = updates.link_url || null;
  if (updates.start_date !== undefined) payload.start_date = updates.start_date || null;
  if (updates.end_date !== undefined) payload.end_date = updates.end_date || null;
  if (updates.is_active !== undefined) payload.is_active = updates.is_active;

  const { error } = await supabase
    .from("announcements")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error("Error updating announcement:", error);
    return false;
  }
  return true;
}

export async function deleteAnnouncement(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting announcement:", error);
    return false;
  }
  return true;
}

// --- Email Campaigns ---
export async function getEmailCampaigns() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("email_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching campaigns:", error);
    return [];
  }
  return data;
}

export async function createEmailCampaign(campaign: any) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("email_campaigns")
    .insert({
        ...campaign,
        updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating campaign:", error);
    return null;
  }
  return data;
}

export async function updateEmailCampaign(id: string, updates: any) {
  const supabase = createClient();
  const { error } = await supabase
    .from("email_campaigns")
    .update({
        ...updates,
        updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating campaign:", error);
    return false;
  }
  return true;
}

export async function deleteEmailCampaign(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("email_campaigns")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting campaign:", error);
    return false;
  }
}
