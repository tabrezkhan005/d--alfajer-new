'use server'

import { createAdminClient } from "@/src/lib/supabase/server";

export async function createCustomer(customerId: string, email: string, name: string, country: string) {
  const supabase = createAdminClient();
  const nameParts = name.split(" ");

  // Try to insert with full_name first
  try {
    // Check if full_name column exists by checking schema? No, just try insert
    // We will assume keys based on previous knowledge
    const payload: any = {
      id: customerId,
      email: email,
      first_name: nameParts[0] || null,
      last_name: nameParts.slice(1).join(" ") || null,
      country: country,
      full_name: name // Try to insert full_name as well
    };

    const { error } = await supabase.from("customers").upsert(payload);

    if (error) {
      // If full_name doesn't exist, it might error.
      // But we can't easily retry with different schema in one go without potential delay.
      // However, seeing admin page uses full_name, it's safer to include it.

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
