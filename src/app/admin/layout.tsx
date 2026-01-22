"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/src/components/admin/sidebar";
import { Navbar } from "@/src/components/admin/navbar";
import { AdminNotificationProvider } from "@/src/lib/admin-notifications";
import { createClient } from "@/src/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setIsCheckingAuth(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push('/admin/login?redirect=' + encodeURIComponent(pathname || '/admin/dashboard'));
          return;
        }

        // Check if user is admin
        const response = await fetch("/api/admin/check-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session.user.id }),
        });

        const data = await response.json();

        if (!data.isAdmin) {
          await supabase.auth.signOut();
          router.push('/admin/login?error=access_denied');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push('/admin/login?error=auth_failed');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Show loading state while checking auth
  if (isCheckingAuth && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Don't render layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Only render admin layout if authorized
  if (!isAuthorized) {
    return null;
  }

  return (
    <AdminNotificationProvider>
      <div className="flex h-screen overflow-hidden relative">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={closeMobileMenu}
        />

        <div
          className={`flex flex-1 flex-col transition-all duration-300 min-w-0 w-full relative z-10 ${
            isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
          } ml-0`}
        >
          <Navbar onMenuClick={toggleMobileMenu} />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-3 sm:p-4 md:p-6 lg:p-8 w-full max-w-full">
            <div className="w-full max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminNotificationProvider>
  );
}
