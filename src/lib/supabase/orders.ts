"use client";

import { createClient } from "./client";

// Interface matching actual database schema
export interface OrderWithItems {
    id: string;
    order_number: string | null;
    user_id: string | null;
    email: string | null;
    status: string | null;
    subtotal: number | null;
    shipping_cost: number | null;
    tax: number | null;
    discount: number | null;
    total: number | null;
    currency: string | null;
    shipping_address: Record<string, unknown> | null;
    billing_address: Record<string, unknown> | null;
    shipping_method: string | null;
    payment_method: string | null;
    payment_status: string | null;
    promo_code: string | null;
    gift_message: string | null;
    notes: string | null;
    tracking_number: string | null;
    created_at: string | null;
    updated_at: string | null;
    items: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string | null;
    variant_id: string | null;
    name: string | null;
    sku: string | null;
    quantity: number;
    price: number | null;
    total: number | null;
    image_url: string | null;
    created_at: string | null;
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

    return (orders || []) as unknown as OrderWithItems[];
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

    return data as unknown as OrderWithItems;
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

    return (data || []) as unknown as OrderWithItems[];
}

// Update order tracking number
export async function updateOrderTrackingNumber(orderId: string, trackingNumber: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("orders")
        .update({ tracking_number: trackingNumber } as any)
        .eq("id", orderId);

    if (error) {
        console.error("Error updating tracking number:", error);
        return false;
    }

    return true;
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

// Update tracking number (admin)
export async function updateTrackingNumber(orderId: string, trackingNumber: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("orders")
        .update({
            tracking_number: trackingNumber,
            updated_at: new Date().toISOString(),
        } as any)
        .eq("id", orderId);

    if (error) {
        console.error("Error updating tracking number:", error);
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
        .select("status, total");

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

    const ordersData = orders as unknown as Array<{ status: string; total: number }>;

    return {
        totalOrders: ordersData.length,
        pendingOrders: ordersData.filter(o => o.status === "pending").length,
        processingOrders: ordersData.filter(o => o.status === "processing").length,
        shippedOrders: ordersData.filter(o => o.status === "shipped").length,
        deliveredOrders: ordersData.filter(o => o.status === "delivered").length,
        totalRevenue: ordersData.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
    };
}

// Create a new order
export async function createOrder(orderData: {
    user_id?: string;
    email: string;
    subtotal: number;
    shipping_cost: number;
    tax: number;
    discount?: number;
    total: number;
    currency?: string;
    shipping_address: Record<string, unknown>;
    billing_address?: Record<string, unknown>;
    shipping_method?: string;
    payment_method: string;
    promo_code?: string;
    gift_message?: string;
    notes?: string;
}): Promise<OrderWithItems | null> {
    const supabase = createClient();

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const orderInsert = {
        order_number: orderNumber,
        user_id: orderData.user_id || null,
        email: orderData.email,
        status: "pending",
        subtotal: orderData.subtotal,
        shipping_cost: orderData.shipping_cost,
        tax: orderData.tax,
        discount: orderData.discount || 0,
        total: orderData.total,
        currency: orderData.currency || "INR",
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address || orderData.shipping_address,
        shipping_method: orderData.shipping_method || "standard",
        payment_method: orderData.payment_method,
        payment_status: "pending",
        promo_code: orderData.promo_code || null,
        gift_message: orderData.gift_message || null,
        notes: orderData.notes || null,
    };

    const { data, error } = await supabase
        .from("orders")
        .insert(orderInsert as any)
        .select()
        .single();

    if (error) {
        console.error("Error creating order:", error);
        return null;
    }

    return { ...data, items: [] } as unknown as OrderWithItems;
}

// Add items to an order
export async function addOrderItems(orderId: string, items: {
    product_id: string;
    variant_id?: string;
    name: string;
    sku?: string;
    quantity: number;
    price: number;
    image_url?: string;
}[]): Promise<boolean> {
    const supabase = createClient();

    const orderItems = items.map(item => ({
        order_id: orderId,
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        name: item.name,
        sku: item.sku || null,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        image_url: item.image_url || null,
    }));

    const { error } = await supabase
        .from("order_items")
        .insert(orderItems as any);

    if (error) {
        console.error("Error adding order items:", error);
        return false;
    }

    return true;
}

// Request order return
export async function requestOrderReturn(orderId: string, reason: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("orders")
        .update({
            status: "return_requested",
            notes: reason,
            updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

    if (error) {
        console.error("Error requesting return:", error);
        return false;
    }

    return true;
}

// Process return (admin)
export async function processReturn(orderId: string, approve: boolean, adminNotes?: string): Promise<boolean> {
    const supabase = createClient();

    const newStatus = approve ? "returned" : "return_rejected";

    const { error } = await supabase
        .from("orders")
        .update({
            status: newStatus,
            notes: adminNotes || null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

    if (error) {
        console.error("Error processing return:", error);
        return false;
    }

    return true;
}
