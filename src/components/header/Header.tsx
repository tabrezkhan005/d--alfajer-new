"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  ShoppingBag,
  Heart,
  User,
  Headphones,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
} from "lucide-react";

import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/src/components/ui/sheet";
import { useCartStore } from "@/src/lib/cart-store.tsx";
import { CartSheet } from "@/src/components/cart";

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { items, openCart, getTotalItems, getTotalPrice } = useCartStore();

  const headerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const fullActionsRef = useRef<HTMLDivElement>(null);
  const compactActionsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!headerRef.current || !logoRef.current) return;

    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      gsap.to(headerRef.current, {
        height: isScrolled ? 60 : 70,
        duration: 0.3,
        ease: "power2.out",
      });
      return;
    }

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    gsap.to(headerRef.current, {
      height: isScrolled ? 56 : 80,
      duration: 0.3,
      ease: "power2.out",
    });

    gsap.to(logoRef.current, {
      scale: isScrolled ? 0.85 : 1,
      duration: 0.3,
      ease: "power2.out",
    });

    if (fullActionsRef.current) {
      gsap.to(fullActionsRef.current, {
        opacity: isScrolled ? 0 : 1,
        x: isScrolled ? 20 : 0,
        duration: 0.25,
        pointerEvents: isScrolled ? "none" : "auto",
        ease: "power2.out",
      });
    }

    if (compactActionsRef.current) {
      gsap.fromTo(
        compactActionsRef.current,
        {
          opacity: isScrolled ? 0 : 1,
          x: isScrolled ? -20 : 0,
        },
        {
          opacity: isScrolled ? 1 : 0,
          x: isScrolled ? 0 : -20,
          duration: 0.25,
          pointerEvents: isScrolled ? "auto" : "none",
          ease: "power2.out",
        }
      );
    }

    if (searchRef.current) {
      gsap.to(searchRef.current, {
        maxWidth: isScrolled ? 500 : 600,
        width: isScrolled ? 500 : 600,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isScrolled]);

  const cartCount = mounted ? getTotalItems() : 0;
  const cartTotal = mounted ? getTotalPrice() : 0;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Dry Fruits", href: "/category/dry-fruits" },
    { name: "Spices", href: "/category/spices" },
    { name: "Dates", href: "/category/dates" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-9 left-0 right-0 z-40 flex items-center
          transition-all duration-300
          ${isScrolled ? "backdrop-blur-md border-b shadow-sm" : ""}
        `}
        style={{
          backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.95)" : "#FFFFFF",
          borderColor: "#E5E7EB",
          height: isScrolled ? (mounted && window.innerWidth < 1024 ? 60 : 56) : (mounted && window.innerWidth < 1024 ? 70 : 80),
        }}
      >
        <div className="relative mx-auto flex w-full max-w-[1920px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:flex-1 justify-start">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden hover:bg-gray-100 rounded-full"
                  aria-label="Menu"
                >
                  <Menu className="h-6 w-6 text-gray-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 border-r-0">
                <div className="flex flex-col h-full bg-white">
                  <SheetHeader className="p-6 border-b bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <Image
                        src="/images/logo/nifajer-logo.png"
                        alt="Al Fajer Mart"
                        width={120}
                        height={40}
                        className="object-contain"
                      />
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <X className="h-5 w-5" />
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto py-6">
                    <nav className="px-6 space-y-1">
                      {navLinks.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          className="flex items-center justify-between py-3.5 text-base font-semibold text-gray-900 border-b border-gray-50 last:border-0 group"
                        >
                          {link.name}
                          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#009744] transition-colors" />
                        </Link>
                      ))}
                    </nav>

                    <div className="mt-8 px-6 space-y-6">
                      <div className="bg-[#009744]/5 rounded-2xl p-6 space-y-4">
                        <h4 className="text-sm font-bold text-[#009744] uppercase tracking-wider">Contact Support</h4>
                        <div className="space-y-3">
                          <a href="tel:+9711234567" className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                            <Phone className="h-4 w-4 text-[#009744]" />
                            +971 123 4567
                          </a>
                          <a href="mailto:support@alfajer.com" className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                            <Mail className="h-4 w-4 text-[#009744]" />
                            support@alfajer.com
                          </a>
                          <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                            <MapPin className="h-4 w-4 text-[#009744]" />
                            Dubai, UAE
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t bg-gray-50/50">
                    <Button className="w-full bg-[#009744] hover:bg-[#2E763B] text-white rounded-full h-12 font-bold shadow-lg">
                      Login / Sign Up
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" aria-label="Home" className="shrink-0">
              <div ref={logoRef} className="flex items-center transition-transform">
                <Image
                  src="/images/logo/nifajer-logo.png"
                  alt="Al Fajer Mart"
                  width={mounted && window.innerWidth < 1024 ? 100 : (isScrolled ? 120 : 150)}
                  height={mounted && window.innerWidth < 1024 ? 32 : (isScrolled ? 40 : 50)}
                  className="object-contain"
                  style={{
                    width: mounted && window.innerWidth < 1024 ? "100px" : (isScrolled ? "120px" : "150px"),
                    height: "auto",
                    maxHeight: mounted && window.innerWidth < 1024 ? "32px" : (isScrolled ? "40px" : "50px"),
                  }}
                  priority
                />
              </div>
            </Link>

            <div
              ref={searchRef}
              className="hidden lg:flex items-center"
              style={{
                maxWidth: isScrolled ? 500 : 600,
                width: isScrolled ? "500px" : "600px",
              }}
            >
              <form
                className="relative w-full flex items-center"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const query = formData.get("search") as string;
                  console.log("Search submitted:", query);
                }}
              >
                <Input
                  type="search"
                  name="search"
                  placeholder="Search for organic products..."
                  className="
                    h-12 pl-6 pr-24 rounded-full
                    bg-white border-2 border-gray-200
                    text-sm
                    focus-visible:ring-2 focus-visible:ring-[#009744]/40 focus-visible:border-[#009744]
                    transition-all duration-200
                    w-full
                  "
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-2 h-8 w-8 rounded-full bg-[#009744] hover:bg-[#2E763B] text-white transition-colors shadow-sm"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 lg:flex-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full hover:bg-gray-100"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-gray-700" />
            </Button>

            <div
              ref={fullActionsRef}
              className="hidden lg:flex items-center gap-4"
            >
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="h-8 w-8 rounded-full bg-[#009744] flex items-center justify-center shrink-0">
                  <Headphones className="h-5 w-6 text-white" />
                </div>
                <span className="text-sm text-gray-700 font-medium whitespace-nowrap">Support</span>
              </div>

              <div className="flex items-center gap-2 cursor-pointer group hover:opacity-80 transition-opacity">
                <Heart className="h-6 w-6 text-gray-600 group-hover:text-pink-500 transition-colors" />
                <span className="text-sm text-gray-700 font-medium group-hover:text-pink-500 transition-colors whitespace-nowrap">Wishlist</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <User className="h-6 w-6 text-gray-600" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm text-gray-900 font-medium">Sign In</span>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Sign In</DropdownMenuItem>
                  <DropdownMenuItem>Create Account</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Orders</DropdownMenuItem>
                  <DropdownMenuItem>Wishlist</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <button
              onClick={openCart}
              className="relative flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity p-2"
              aria-label="Shopping cart"
            >
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-[#009744]" />
                {cartCount > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#AB1F23] flex items-center justify-center border-2 border-white">
                    <span className="text-[8px] font-bold text-white leading-none">{cartCount > 9 ? "9+" : cartCount}</span>
                  </div>
                )}
              </div>
              <div className="hidden sm:flex flex-col items-start lg:hidden xl:flex">
                {!isScrolled && (
                  <>
                    <span className="text-[10px] font-bold text-gray-500 uppercase leading-tight tracking-wider">My Cart</span>
                    <span className="text-xs font-bold text-gray-900 leading-tight">
                      {cartTotal > 0 ? `AED ${cartTotal.toFixed(2)}` : "AED 0.00"}
                    </span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-white border-b p-4 lg:hidden"
            >
              <form
                className="relative w-full flex items-center"
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsSearchOpen(false);
                }}
              >
                <Input
                  autoFocus
                  type="search"
                  placeholder="Search for products..."
                  className="h-12 pl-6 pr-12 rounded-full bg-gray-50 border-0 focus-visible:ring-2 focus-visible:ring-[#009744]/40"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1.5 h-9 w-9 rounded-full bg-[#009744] hover:bg-[#2E763B] text-white"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartSheet />
    </>
  );
}
