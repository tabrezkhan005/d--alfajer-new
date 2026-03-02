'use server'

import { createAdminClient } from "@/src/lib/supabase/server";

export async function createCustomer(customerId: string, email: string, name: string, country: string) {
  const supabase = createAdminClient();

  try {
    const payload = {
      id: customerId,
      email: email,
      full_name: name,
      country: country,
    };

    const { error } = await supabase.from("customers").upsert(payload, {
      onConflict: 'id',
    });

    if (error) {
      console.error("Error creating customer in server action:", error);

      // If it's unique constraint violation, user already exists, which is fine
      if (error.code === '23505') {
          return { success: true };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Server action exception:", err);
    return { success: false, error: "Internal server error" };
  }
}

// Auto-confirm a user's email after signup (bypasses email confirmation requirement)
export async function autoConfirmUser(userId: string) {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (error) {
      console.error("Error auto-confirming user:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Auto-confirm exception:", err);
    return { success: false, error: "Internal server error" };
  }
}
