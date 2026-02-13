
import { createAdminClient } from "@/src/lib/supabase/server";
import { getShiprocketToken } from "@/src/lib/shiprocket";

/**
 * Helper to get cached Shiprocket token or refresh it.
 * This prevents account lockouts by reusing the token for 24h.
 *
 * @param supabaseOptional - Optional Supabase client. If not provided, a new admin client will be created.
 */
export async function getOrRefreshShiprocketToken(supabaseOptional?: any): Promise<string> {
  const supabase = supabaseOptional || createAdminClient();

  // 1. Try to get cached token
  const { data: settings } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', 'shiprocket_auth')
    .single();

  if (settings?.value) {
    const { token, expires_at } = settings.value;
    // Check if token exists and is valid (with 1 hour buffer)
    if (token && expires_at && Date.now() < expires_at - 60 * 60 * 1000) {
      console.log("✅ Using cached Shiprocket token");
      return token;
    }
  }

  // 2. Token missing or expired -> Refresh
  console.log("🔄 Refreshing Shiprocket token (missing or expired)...");

  let email = process.env.SHIPROCKET_EMAIL || process.env.NEXT_PUBLIC_SHIPROCKET_EMAIL;
  let password = process.env.SHIPROCKET_PASSWORD || process.env.NEXT_PUBLIC_SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error("Shiprocket credentials (SHIPROCKET_EMAIL/PASSWORD) not configured in env.");
  }

  // Clean credentials (remove quotes if present)
  if (email.startsWith("'") && email.endsWith("'")) email = email.slice(1, -1);
  if (email.startsWith('"') && email.endsWith('"')) email = email.slice(1, -1);
  email = email.trim();

  if (password.startsWith("'") && password.endsWith("'")) password = password.slice(1, -1);
  if (password.startsWith('"') && password.endsWith('"')) password = password.slice(1, -1);
  password = password.trim();

  // Login
  const authResult = await getShiprocketToken(email, password);

  if ("error" in authResult) {
    console.error("Shiprocket Auth Failed. Response:", authResult);
    throw new Error(`Authentication failed: ${authResult.error}`);
  }

  const newToken = authResult.token;
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now

  // 3. Cache new token
  const { error: saveError } = await supabase.from('store_settings').upsert({
    key: 'shiprocket_auth',
    value: { token: newToken, expires_at: expiresAt },
    updated_at: new Date().toISOString()
  }, { onConflict: 'key' });

  if (saveError) {
    console.warn("⚠️ Failed to cache Shiprocket token:", saveError.message);
  } else {
    console.log("✅ Shiprocket token cached successfully");
  }

  return newToken;
}
