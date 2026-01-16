"use client";

import { createClient } from "./client";
import type { Database } from "./database.types";

type GiftCard = Database["public"]["Tables"]["gift_cards"]["Row"];
type LoyaltyPoints = Database["public"]["Tables"]["loyalty_points"]["Row"];

// ============ GIFT CARDS ============

// Generate a random gift card code
function generateGiftCardCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 16; i++) {
        if (i > 0 && i % 4 === 0) code += "-";
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Create a gift card
export async function createGiftCard(giftCard: {
    initial_balance: number;
    purchased_by?: string;
    recipient_name?: string;
    recipient_email?: string;
    message?: string;
    currency?: string;
    expires_at?: string;
}): Promise<GiftCard | null> {
    const supabase = createClient();
    const code = generateGiftCardCode();

    const { data, error } = await supabase
        .from("gift_cards")
        .insert({
            code,
            initial_balance: giftCard.initial_balance,
            current_balance: giftCard.initial_balance,
            purchased_by: giftCard.purchased_by || null,
            recipient_name: giftCard.recipient_name || null,
            recipient_email: giftCard.recipient_email || null,
            message: giftCard.message || null,
            currency: giftCard.currency || "INR",
            expires_at: giftCard.expires_at || null,
            is_active: true,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating gift card:", error);
        return null;
    }

    return data;
}

// Get gift card by code
export async function getGiftCardByCode(code: string): Promise<GiftCard | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("gift_cards")
        .select("*")
        .eq("code", code.toUpperCase().replace(/-/g, ""))
        .eq("is_active", true)
        .single();

    if (error) {
        console.error("Error fetching gift card:", error);
        return null;
    }

    return data;
}

// Apply gift card to order
export async function applyGiftCard(
    code: string,
    amountToDeduct: number
): Promise<{ success: boolean; remainingBalance?: number; error?: string }> {
    const supabase = createClient();
    const giftCard = await getGiftCardByCode(code);

    if (!giftCard) {
        return { success: false, error: "Gift card not found" };
    }

    if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
        return { success: false, error: "Gift card has expired" };
    }

    if (giftCard.current_balance < amountToDeduct) {
        return { success: false, error: "Insufficient balance" };
    }

    const newBalance = giftCard.current_balance - amountToDeduct;

    const { error } = await supabase
        .from("gift_cards")
        .update({ current_balance: newBalance })
        .eq("id", giftCard.id);

    if (error) {
        return { success: false, error: "Failed to apply gift card" };
    }

    return { success: true, remainingBalance: newBalance };
}

// Get gift cards purchased by a customer
export async function getCustomerGiftCards(customerId: string): Promise<GiftCard[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("gift_cards")
        .select("*")
        .eq("purchased_by", customerId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching gift cards:", error);
        return [];
    }

    return data || [];
}

// ============ LOYALTY POINTS ============

// Get total loyalty points for a customer
export async function getLoyaltyPointsBalance(customerId: string): Promise<number> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("loyalty_points")
        .select("points, type, expires_at")
        .eq("customer_id", customerId);

    if (error || !data) {
        return 0;
    }

    const now = new Date();
    let balance = 0;

    for (const record of data) {
        // Skip expired points
        if (record.expires_at && new Date(record.expires_at) < now) {
            continue;
        }

        if (record.type === "earn") {
            balance += record.points;
        } else if (record.type === "redeem") {
            balance -= record.points;
        }
    }

    return Math.max(0, balance);
}

// Get loyalty points history
export async function getLoyaltyPointsHistory(customerId: string): Promise<LoyaltyPoints[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("loyalty_points")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching loyalty points history:", error);
        return [];
    }

    return data || [];
}

// Add loyalty points
export async function addLoyaltyPoints(
    customerId: string,
    points: number,
    description: string,
    orderId?: string
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("loyalty_points")
        .insert({
            customer_id: customerId,
            points,
            type: "earn",
            description,
            order_id: orderId || null,
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year expiry
        });

    if (error) {
        console.error("Error adding loyalty points:", error);
        return false;
    }

    return true;
}

// Redeem loyalty points
export async function redeemLoyaltyPoints(
    customerId: string,
    points: number,
    description: string,
    orderId?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    // Check if customer has enough points
    const balance = await getLoyaltyPointsBalance(customerId);

    if (balance < points) {
        return { success: false, error: "Insufficient points" };
    }

    const { error } = await supabase
        .from("loyalty_points")
        .insert({
            customer_id: customerId,
            points,
            type: "redeem",
            description,
            order_id: orderId || null,
        });

    if (error) {
        console.error("Error redeeming loyalty points:", error);
        return { success: false, error: "Failed to redeem points" };
    }

    return { success: true };
}

// Convert points to currency (1 point = 1 INR by default)
export function pointsToCurrency(points: number, rate: number = 1): number {
    return points * rate;
}

// Convert currency to points (10 INR = 1 point by default)
export function currencyToPoints(amount: number, rate: number = 10): number {
    return Math.floor(amount / rate);
}
