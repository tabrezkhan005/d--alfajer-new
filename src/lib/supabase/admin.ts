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

    const { data, error } = await supabase
        .from("products")
        .insert({
            ...product,
            is_active: product.is_active ?? true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as any)
        .select()
        .single();

    if (error) {
        console.error("Error creating product:", error);
        return null;
    }

    return data;
}

// Update a product (admin)
export async function updateProduct(
    productId: string,
    updates: Partial<Product>
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("products")
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
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
}): Promise<ProductVariant | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("product_variants")
        .insert(variant)
        .select()
        .single();

    if (error) {
        console.error("Error creating variant:", error);
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
      variants:product_variants(*)
    `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching admin products:", error);
        return [];
    }

    return (data || []) as (Product & { variants: ProductVariant[] })[];
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
        // Revenue (sum total_amount)
        supabase.from('orders').select('total_amount').neq('status', 'cancelled'),
        // Active products
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        // Total customers
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        // Recent orders
        supabase.from('orders')
            .select(`
                id, 
                user_id, 
                total_amount, 
                status, 
                created_at, 
                customers:customers!orders_user_id_fkey(first_name, last_name, email)
            `)
            .order('created_at', { ascending: false })
            .limit(5),
        // Low stock products (less than 10)
        supabase.from('product_variants')
            .select('product_id, stock_quantity, products(id, name, slug)')
            .lt('stock_quantity', 10)
            .limit(5)
    ]);

    // Calculate total revenue
    const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // Calculate growth (mock logic for now as we don't have historical data easily accessible without complex queries)
    const stats = {
        totalRevenue: { value: totalRevenue, change: 0 },
        totalOrders: { value: orderCount || 0, change: 0 },
        activeProducts: { value: productsCount || 0, change: 0 },
        activeCustomers: { value: customersCount || 0, change: 0 },
        recentOrders: recentOrders || [],
        lowStockProducts: lowStockProducts?.map(p => ({
            id: p.product_id,
            name: p.products?.name,
            slug: p.products?.slug,
            stock: p.stock_quantity
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
        .select('created_at, total_amount')
        .gte('created_at', sevenDaysAgo.toISOString())
        .neq('status', 'cancelled')
        .order('created_at');

    // Group by day
    const chartData: Record<string, number> = {};
    orders?.forEach(order => {
        if (!order.created_at) return;
        const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        chartData[date] = (chartData[date] || 0) + order.total_amount;
    });

    return Object.entries(chartData).map(([date, amount]) => ({ name: date, total: amount }));
}
