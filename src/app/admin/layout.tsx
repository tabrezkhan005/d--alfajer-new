"use client";

import { useState } from "react";
import { Sidebar } from "@/src/components/admin/sidebar";
import { Navbar } from "@/src/components/admin/navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
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
  );
}
