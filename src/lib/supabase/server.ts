import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/src/lib/supabase/database.types";
// Force Node to use the correct Cloudflare IP for Supabase
// This bypasses local DNS hijacking (Jio NAT64)
if (typeof window === "undefined") {
  const dns = eval('require("node:dns")');
  const originalLookup = dns.lookup;
  // @ts-ignore - overriding built-in Node type
  dns.lookup = (hostname: string, options: any, callback: any) => {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    // Intercept any Supabase domain resolution
    if (hostname.includes("supabase.co")) {
      if (options && options.all) {
        return callback(null, [{ address: "104.18.38.10", family: 4 }]);
      }
      return callback(null, "104.18.38.10", 4);
    }
    return originalLookup(hostname, options, callback);
  };
}

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing sessions.
                    }
                },
            },
        }
    );
}

// Admin client with service role key for server-side operations
export function createAdminClient() {
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() {
                    return [];
                },
                setAll() { },
            },
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}
