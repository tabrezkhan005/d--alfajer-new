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
import { useCartStore } from "@/src/lib/cart-store.tsx";
import { CartSheet } from "@/src/components/cart";

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
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

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-9 left-0 right-0 z-40 flex items-center
          transition-all duration-300
          ${isScrolled ? "backdrop-blur-md border-b" : ""}
        `}
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#E5E7EB",
          height: isScrolled ? 56 : 80,
        }}
      >
        <div className="relative mx-auto flex w-full max-w-[1920px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex-[0.3] hidden lg:block" />

          <div className="flex items-center gap-4 flex-1 justify-start">
            <Link href="/" aria-label="Home" className="shrink-0">
              <div ref={logoRef} className="flex items-center transition-transform">
                <Image
                  src="/images/logo/nifajer-logo.png"
                  alt="Al Fajer Mart"
                  width={isScrolled ? 120 : 150}
                  height={isScrolled ? 40 : 50}
                  className="object-contain"
                  style={{
                    width: isScrolled ? "120px" : "150px",
                    height: "auto",
                    maxHeight: isScrolled ? "40px" : "50px",
                  }}
                  priority
                />
              </div>
            </Link>

            <div
              ref={searchRef}
              className="hidden md:flex items-center"
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
                  placeholder="Search for organic products, dry fruits, honey..."
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

          <div className="flex items-center gap-3 lg:gap-4 flex-1 justify-end">
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

            <div
              ref={compactActionsRef}
              className="hidden lg:flex items-center gap-3"
              style={{ opacity: isScrolled ? 1 : 0, pointerEvents: isScrolled ? "auto" : "none" }}
            >
                <button
                  className="h-10 w-10 rounded-full bg-[#009744] flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="Support"
                >
                  <Headphones className="h-5 w-6 text-white" />
                </button>
                <button
                  className="flex items-center justify-center hover:text-pink-500 transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart className="h-6 w-8 text-gray-600" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center justify-center hover:opacity-80 transition-opacity"
                      aria-label="Account"
                    >
                      <User className="h-6 w-8 text-gray-600" />
                    </button>
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
              className="relative flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Shopping cart"
            >
              {!isScrolled ? (
                <>
                  <div className="relative">
                    <ShoppingCart className="h-6 w-8 text-[#009744]" />
                    {cartCount > 0 && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#AB1F23] flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white leading-none">{cartCount > 9 ? "9+" : cartCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-700 uppercase leading-tight">My Cart</span>
                    <span className="text-sm font-semibold text-gray-900 leading-tight">
                      {cartTotal > 0 ? `AED ${cartTotal.toFixed(2)}` : "AED 0.00"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="relative">
                  <ShoppingCart className="h-6 w-6 text-[#009744]" />
                  {cartCount > 0 && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#AB1F23] flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white leading-none">{cartCount > 9 ? "9+" : cartCount}</span>
                    </div>
                  )}
                </div>
              )}
            </button>

            {!isScrolled && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <CartSheet />
    </>
  );
}
