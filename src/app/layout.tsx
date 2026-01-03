import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/src/components/providers";
import { AnnouncementBar } from "@/src/components/announcement-bar/AnnouncementBar";
import { Header } from "@/src/components/header/Header";
import { DynamicFavicon } from "@/src/components/header/DynamicFavicon";
import { Footer } from "@/src/components/ui/large-name-footer";

export const metadata: Metadata = {
  title: "Al Fajer - Premium Dry Fruits & Spices",
  description: "Experience the finest quality dry fruits, nuts, and exotic spices. 100% authentic premium products delivered worldwide.",
  keywords: ["dry fruits", "spices", "nuts", "premium food", "authentic spices"],
  authors: [{ name: "Al Fajer" }],
  openGraph: {
    title: "Al Fajer - Premium Dry Fruits & Spices",
    description: "Experience the finest quality dry fruits, nuts, and exotic spices.",
    url: "https://alfajer.com",
    siteName: "Al Fajer",
    images: [
      {
        url: "/images/logo/nifajer-logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Al Fajer - Premium Dry Fruits & Spices",
    description: "Experience the finest quality dry fruits, nuts, and exotic spices.",
    images: ["/images/logo/nifajer-logo.png"],
  },
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
