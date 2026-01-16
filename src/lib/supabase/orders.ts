"use client";

import { createClient } from "./client";
import type { Database } from "./database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

export interface OrderWithItems extends Order {
    items: OrderItem[];
}

// Get orders for a user
export async function getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const supabase = createClient();

    const { data: orders, error } = await supabase
        .from("orders")
        .select(`
      *,
      items:order_items(*)
    `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching orders:", error);
        return [];
    }

    return (orders || []) as OrderWithItems[];
}

// Get a single order by ID
export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("orders")
        .select(`
      *,
      items:order_items(*)
    `)
        .eq("id", orderId)
        .single();

    if (error) {
        console.error("Error fetching order:", error);
        return null;
    }

    return data as OrderWithItems;
}

// Get all orders (admin)
export async function getAllOrders(options?: {
    status?: string;
    limit?: number;
    offset?: number;
}): Promise<OrderWithItems[]> {
    const supabase = createClient();

    let query = supabase
        .from("orders")
        .select(`
      *,
      items:order_items(*)
    `)
        .order("created_at", { ascending: false });

    if (options?.status && options.status !== "all") {
        query = query.eq("status", options.status);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching orders:", error);
        return [];
    }

    return (data || []) as OrderWithItems[];
}

// Update order status (admin)
export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("orders")
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

    if (error) {
        console.error("Error updating order status:", error);
        return false;
    }

    return true;
}

// Update tracking ID (admin)
export async function updateTrackingId(orderId: string, trackingId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("orders")
        .update({
            tracking_id: trackingId,
            updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

    if (error) {
        console.error("Error updating tracking ID:", error);
        return false;
    }

    return true;
}

// Get order statistics (admin dashboard)
export async function getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    totalRevenue: number;
}> {
    const supabase = createClient();

    const { data: orders, error } = await supabase
        .from("orders")
        .select("status, total_amount");

    if (error || !orders) {
        return {
            totalOrders: 0,
            pendingOrders: 0,
            processingOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
            totalRevenue: 0,
        };
    }

    return {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === "pending").length,
        processingOrders: orders.filter(o => o.status === "processing").length,
        shippedOrders: orders.filter(o => o.status === "shipped").length,
        deliveredOrders: orders.filter(o => o.status === "delivered").length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    };
}
