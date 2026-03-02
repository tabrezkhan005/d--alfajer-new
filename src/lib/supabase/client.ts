"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/src/lib/supabase/database.types";

// Force Node to use the correct Cloudflare IP for Supabase
// This bypasses local DNS hijacking (Jio NAT64) — ONLY in development
if (typeof window === "undefined" && process.env.NODE_ENV === "development") {
  try {
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
  } catch (e) {
    // Ignore DNS override errors
  }
}

export function createClient() {
    const isBrowser = typeof window !== 'undefined';
    const supabaseUrl = isBrowser
        ? `${window.location.origin}/api/supabase`
        : process.env.NEXT_PUBLIC_SUPABASE_URL!;

    return createBrowserClient<Database>(
        supabaseUrl,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// Singleton instance for client-side usage
let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
    if (typeof window === "undefined") {
        throw new Error("getSupabaseClient should only be called on the client side");
    }
    if (!browserClient) {
        browserClient = createClient();
    }
    return browserClient;
}
