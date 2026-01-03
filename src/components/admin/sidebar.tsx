"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { getGreeting } from "@/src/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Megaphone,
  Truck,
  CreditCard,
  BarChart3,
  FileText,
  Cookie,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  List,
  Tag,
  Box,
  Clock,
  RotateCcw,
  UserCircle,
  Gift,
  Image,
  Mail,
  MapPin,
  DollarSign,
  Receipt,
  Shield,
  Search,
  FileEdit,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Separator } from "@/src/components/ui/separator";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
    children: [
      { title: "All Products", href: "/admin/products", icon: List },
      { title: "Add Product", href: "/admin/products/new", icon: Plus },
      { title: "Categories", href: "/admin/products/categories", icon: Tag },
      { title: "Inventory", href: "/admin/products/inventory", icon: Box },
    ],
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    children: [
      { title: "All Orders", href: "/admin/orders", icon: List },
      { title: "Pending Orders", href: "/admin/orders?status=pending", icon: Clock },
      { title: "Returns & Refunds", href: "/admin/orders/returns", icon: RotateCcw },
    ],
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
    children: [
      { title: "Customer List", href: "/admin/customers", icon: List },
    ],
  },
  {
    title: "Marketing",
    href: "/admin/marketing",
    icon: Megaphone,
    children: [
      { title: "Coupons & Discounts", href: "/admin/marketing/coupons", icon: Gift },
      { title: "Banners & Sections", href: "/admin/marketing/banners", icon: Image },
      { title: "Email Campaigns", href: "/admin/marketing/emails", icon: Mail },
    ],
  },
  {
    title: "Shipping & Tax",
    href: "/admin/shipping",
    icon: Truck,
    children: [
      { title: "Shipping Zones", href: "/admin/shipping/zones", icon: MapPin },
      { title: "Delivery Charges", href: "/admin/shipping/charges", icon: DollarSign },
      { title: "Tax Settings", href: "/admin/shipping/tax", icon: Receipt },
    ],
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    children: [
      { title: "Payment Methods", href: "/admin/payments/methods", icon: CreditCard },
      { title: "Transactions", href: "/admin/payments/transactions", icon: Receipt },
      { title: "Refund Logs", href: "/admin/payments/refunds", icon: RotateCcw },
    ],
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    children: [
      { title: "Sales Reports", href: "/admin/analytics/sales", icon: BarChart3 },
      { title: "Product Performance", href: "/admin/analytics/products", icon: Package },
      { title: "Customer Insights", href: "/admin/analytics/customers", icon: Users },
    ],
  },
  {
    title: "Content",
    href: "/admin/content",
    icon: FileText,
    children: [
      { title: "Pages", href: "/admin/content/pages", icon: FileEdit },
      { title: "Blogs", href: "/admin/content/blogs", icon: FileText },
      { title: "SEO Settings", href: "/admin/content/seo", icon: Search },
    ],
  },
  {
    title: "Cookies & Privacy",
    href: "/admin/cookies",
    icon: Cookie,
    children: [
      { title: "Cookie Categories", href: "/admin/cookies/categories", icon: Cookie },
      { title: "Consent Banner", href: "/admin/cookies/banner", icon: Shield },
      { title: "Tracking Scripts", href: "/admin/cookies/tracking", icon: FileText },
    ],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    children: [
      { title: "Store Settings", href: "/admin/settings/store", icon: Settings },
      { title: "Notifications", href: "/admin/settings/notifications", icon: Mail },
      { title: "Roles & Permissions", href: "/admin/settings/roles", icon: Shield },
      { title: "Security", href: "/admin/settings/security", icon: Shield },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [greeting, setGreeting] = useState(getGreeting());
  const sidebarRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.fromTo(
        sidebarRef.current,
        { x: -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
        }
      );
    }
  }, []);

  useEffect(() => {
    if (navRef.current && !isCollapsed) {
      const items = navRef.current.querySelectorAll("a, button");
      gsap.fromTo(
        Array.from(items),
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    }
  }, [isCollapsed]);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.href);
    const active = isActive(item.href);
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <div key={item.href}>
          <button
            onClick={() => toggleExpanded(item.href)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              active && "bg-accent text-accent-foreground",
              isCollapsed && "justify-center"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.title}</span>
                {isExpanded ? (
                  <ChevronRight className="h-4 w-4 rotate-90" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </>
            )}
          </button>
          {!isCollapsed && isExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children?.map((child) => {
                const ChildIcon = child.icon;
                const childActive = isActive(child.href);
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      childActive && "bg-accent text-accent-foreground font-medium"
                    )}
                  >
                    <ChildIcon className="h-4 w-4 shrink-0" />
                    <span>{child.title}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          active && "bg-accent text-accent-foreground",
          isCollapsed && "justify-center"
        )}
        title={isCollapsed ? item.title : undefined}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span>{item.title}</span>}
      </Link>
    );
  };

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{greeting}</span>
              <h2 className="text-lg font-semibold">Admin</h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <nav ref={navRef} className="space-y-1">{navItems.map((item) => renderNavItem(item))}</nav>
        </ScrollArea>
      </div>
    </aside>
  );
};
