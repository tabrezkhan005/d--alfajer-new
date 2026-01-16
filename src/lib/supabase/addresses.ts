"use client";

import { createClient } from "./client";
import type { Database } from "./database.types";

type Address = Database["public"]["Tables"]["addresses"]["Row"];

// Get all addresses for a customer
export async function getAddresses(customerId: string): Promise<Address[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("customer_id", customerId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching addresses:", error);
        return [];
    }

    return data || [];
}

// Create a new address
export async function createAddress(address: {
    customer_id: string;
    type?: "shipping" | "billing";
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default?: boolean;
}): Promise<Address | null> {
    const supabase = createClient();

    // If this is set as default, unset other defaults first
    if (address.is_default) {
        await supabase
            .from("addresses")
            .update({ is_default: false })
            .eq("customer_id", address.customer_id);
    }

    const { data, error } = await supabase
        .from("addresses")
        .insert(address)
        .select()
        .single();

    if (error) {
        console.error("Error creating address:", error);
        return null;
    }

    return data;
}

// Update an address
export async function updateAddress(
    addressId: string,
    updates: Partial<Address>
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("addresses")
        .update(updates)
        .eq("id", addressId);

    if (error) {
        console.error("Error updating address:", error);
        return false;
    }

    return true;
}

// Delete an address
export async function deleteAddress(addressId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", addressId);

    if (error) {
        console.error("Error deleting address:", error);
        return false;
    }

    return true;
}

// Set an address as default
export async function setDefaultAddress(
    addressId: string,
    customerId: string
): Promise<boolean> {
    const supabase = createClient();

    // Unset all other defaults
    await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("customer_id", customerId);

    // Set this one as default
    const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", addressId);

    if (error) {
        console.error("Error setting default address:", error);
        return false;
    }

    return true;
}
