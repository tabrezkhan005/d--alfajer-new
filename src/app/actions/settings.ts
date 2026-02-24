"use server";

import { createAdminClient } from "@/src/lib/supabase/server";

/**
 * Fetch a specific store setting safely from the server.
 * Bypasses RLS to allow public access to safe settings like cookie_banner_settings.
 */
export async function getPublicStoreSetting(key: string): Promise<any> {
  try {
    // Only allow specific safe keys
    const safeKeys = ["cookie_banner_settings", "store_name"];
    if (!safeKeys.includes(key)) {
      throw new Error(`Access to setting '${key}' is restricted.`);
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("store_settings" as any)
      .select("value")
      .eq("key", key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      console.error(`Error fetching public store setting '${key}':`, error);
      return null;
    }

    return (data as any)?.value;
  } catch (err) {
    console.error(`Exception in getPublicStoreSetting for '${key}':`, err);
    return null;
  }
}
