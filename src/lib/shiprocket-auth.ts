
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
    const { token, expires_at, failed } = settings.value;

    // Check if we have an active failure cooldown
    if (failed && expires_at && Date.now() < expires_at) {
      console.warn("⚠️ Shiprocket auth is currently in cooldown mode to prevent account lockout.");
      throw new Error("Shiprocket authentication cooldown. Please try again later or check credentials.");
    }

    // Check if token exists and is valid (with 1 hour buffer)
    if (token && expires_at && Date.now() < expires_at - 60 * 60 * 1000) {
      console.log("✅ Using cached Shiprocket token");
      return token;
    }
  }

  // 2. Token missing or expired -> Refresh
  console.log("🔄 Refreshing Shiprocket token (missing or expired)...");

  // Attempt to fetch credentials from Admin Panel configuration (User Metadata) first
  let email = "";
  let password = "";

  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();

  if (!usersError && usersData && usersData.users.length > 0) {
    // Find the first admin user that has shiprocket_config set
    const adminUser = usersData.users.find((u: any) => u.user_metadata?.shiprocket_config?.email);

    if (adminUser) {
      email = adminUser.user_metadata.shiprocket_config.email;
      password = adminUser.user_metadata.shiprocket_config.password;
      console.log("✅ Using Shiprocket credentials from Admin Panel configuration.");
    }
  }

  // Fallback to .env if Admin Panel wasn't configured
  if (!email || !password) {
    console.log("⚠️ Admin Panel Shiprocket config not found, falling back to .env credentials...");
    email = process.env.SHIPROCKET_EMAIL || "";
    password = process.env.SHIPROCKET_PASSWORD || "";
  }

  if (!email || !password) {
    throw new Error("Shiprocket credentials not configured in Admin Panel or .env file.");
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

    // Cache the failure for 30 minutes to prevent account lockout
    const failureExpiresAt = Date.now() + 30 * 60 * 1000;
    await supabase.from('store_settings').upsert({
      key: 'shiprocket_auth',
      value: { failed: true, expires_at: failureExpiresAt },
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

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
