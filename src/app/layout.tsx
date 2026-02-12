import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/src/components/providers";
import { AnnouncementBar } from "@/src/components/announcement-bar/AnnouncementBar";
import { Header } from "@/src/components/header/Header";
import { DynamicFavicon } from "@/src/components/header/DynamicFavicon";
import { AdminFooterWrapper } from "@/src/components/admin/admin-footer-wrapper";
import { MetaPixel } from "@/src/components/analytics/MetaPixel";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Premium Dry Fruits & Spices",
  description: "100% authentic premium dry fruits and spices delivered worldwide",
  icons: {
    icon: "/images/alfajerlogo.jpeg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/alfajerlogo.jpeg" />
      </head>
      <body className="antialiased overflow-x-clip w-full" suppressHydrationWarning>
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <DynamicFavicon />
          <AnnouncementBar />
          <Header />
          <AdminFooterWrapper>
            <main className="mt-0 pt-0 w-full overflow-x-clip">
              {children}
            </main>
          </AdminFooterWrapper>
        </Providers>
      </body>
    </html>
  );
}
