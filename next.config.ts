import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ijchxbtovluwlrdbwrqb.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // NOTE: Do NOT use removeConsole in production — it silently strips all
  // console.log / console.error, making it impossible to debug email, webhook,
  // and Shiprocket issues on Vercel.  Logs are visible in Vercel → Deployments → Function Logs.
  // compiler: {
  //   removeConsole: process.env.NODE_ENV === "production",
  // },
};

export default nextConfig;
