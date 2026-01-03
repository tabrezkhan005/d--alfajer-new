"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/src/components/ui/large-name-footer";

export function AdminFooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <>
      {children}
      {!isAdminRoute && <Footer />}
    </>
  );
}
