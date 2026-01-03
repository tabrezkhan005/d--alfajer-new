import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/src/components/providers";
import { AnnouncementBar } from "@/src/components/announcement-bar/AnnouncementBar";
import { Header } from "@/src/components/header/Header";
import { DynamicFavicon } from "@/src/components/header/DynamicFavicon";
import { Footer } from "@/src/components/ui/large-name-footer";

export const metadata: Metadata = {
  title: "Premium Dry Fruits & Spices",
  description: "100% authentic premium dry fruits and spices delivered worldwide",
  icons: {
    icon: "/images/logo/nifajer-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logo/nifajer-logo.png" />
      </head>
      <body className="antialiased">
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <DynamicFavicon />
          <AnnouncementBar />
          <Header />
          <main className="mt-0 pt-0">
        {children}
          </main>
          <Footer />
          </Providers>
      </body>
    </html>
  );
}
