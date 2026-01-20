"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
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
import { useCartStore } from "@/src/lib/cart-store";
import { CartSheet } from "@/src/components/cart";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { useAuth } from "@/src/lib/auth-context";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { items, openCart, getTotalItems, getTotalPrice } = useCartStore();
  const { t, formatCurrency, convertCurrency, currency, language, setLanguage } = useI18n();
  const { user, isLoggedIn, logout } = useAuth();

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
        maxWidth: isScrolled ? "clamp(200px, 40vw, 300px)" : "clamp(250px, 45vw, 400px)",
        width: isScrolled ? "clamp(200px, 40vw, 300px)" : "clamp(250px, 45vw, 400px)",
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
        className={`fixed top-6 xs:top-6 sm:top-8 md:top-9 left-0 right-0 z-40 flex items-center
          transition-all duration-300
          ${isScrolled ? "backdrop-blur-md border-b" : ""}
        `}
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#E5E7EB",
          height: isScrolled ? "clamp(44px, 10vw, 56px)" : "clamp(60px, 12vw, 80px)",
        }}
      >
        <div className="relative mx-auto flex w-full max-w-[1920px] items-center justify-between px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex-[0.3] hidden lg:block" />

          <div className="flex items-center gap-1 xs:gap-2 sm:gap-4 flex-1 justify-start min-w-0">
            <Link href="/" aria-label="Home" className="shrink-0">
              <div ref={logoRef} className="flex items-center transition-transform">
                <div className="relative flex items-center justify-center rounded-full transition-all"
                  style={{
                    width: isScrolled ? "clamp(44px, 10vw, 56px)" : "clamp(60px, 12vw, 80px)",
                    height: isScrolled ? "clamp(44px, 10vw, 56px)" : "clamp(60px, 12vw, 80px)",
                    backgroundColor: "#f0f0f0",
                    border: "2px solid #e5e7eb",
                  }}>
                  <Image
                    src="/images/alfajernewlogo.jpeg"
                    alt="Al Fajer Mart"
                    width={isScrolled ? 80 : 110}
                    height={isScrolled ? 25 : 35}
                    className="object-contain"
                    style={{
                      width: isScrolled ? "clamp(32px, 8vw, 48px)" : "clamp(48px, 10vw, 64px)",
                      height: "auto",
                    }}
                    priority
                  />
                </div>
              </div>
            </Link>

            <div
              ref={searchRef}
              className="hidden md:flex items-center"
              style={{
                maxWidth: isScrolled ? 300 : 400,
                width: isScrolled ? "300px" : "400px",
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
                  placeholder={t('common.search') + " for organic products, dry fruits, honey..."}
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

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1 justify-end">
            {/* Desktop: Full actions */}
            <div
              ref={fullActionsRef}
              className="hidden lg:flex items-center gap-3 lg:gap-4"
            >
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 px-2 text-gray-700 hover:text-[#009744] hover:bg-transparent">
                    <span className="text-xs md:text-sm font-medium uppercase">{language}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer">English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('ar')} className="cursor-pointer">العربية</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('hi')} className="cursor-pointer">हिंदी</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Link href="/support" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#009744] flex items-center justify-center shrink-0">
                    <Headphones className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs md:text-sm text-gray-700 font-medium whitespace-nowrap">{t('header.support')}</span>
                </Link>
              </div>

              <div className="flex items-center gap-2 cursor-pointer group hover:opacity-80 transition-opacity">
                <Link href="/wishlist" className="flex items-center gap-2">
                  <Heart className="h-5 md:h-6 w-5 md:w-6 text-gray-600 group-hover:text-pink-500 transition-colors" />
                  <span className="text-xs md:text-sm text-gray-700 font-medium group-hover:text-pink-500 transition-colors whitespace-nowrap">{t('product.wishlist')}</span>
                </Link>
              </div>

              {isLoggedIn ? (
                <div className="group relative">
                  <Link href="/account" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <User className="h-5 md:h-6 w-5 md:w-6 text-gray-600" />
                    <div className="flex flex-col items-start">
                      <span className="text-xs md:text-sm text-gray-900 font-medium">{user?.name || t('nav.account')}</span>
                    </div>
                  </Link>
                  {/* Hover Dropdown Logout */}
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 z-50">
                    <button
                      onClick={() => {
                        logout();
                        router.push("/");
                      }}
                      className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm font-medium rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <User className="h-5 md:h-6 w-5 md:w-6 text-gray-600" />
                  <span className="text-xs md:text-sm text-gray-700 font-medium whitespace-nowrap">Login</span>
                </Link>
              )}
            </div>

            {/* Desktop: Compact actions (when scrolled) */}
            <div
              ref={compactActionsRef}
              className="hidden lg:flex items-center gap-2 md:gap-3"
              style={{ opacity: isScrolled ? 1 : 0, pointerEvents: isScrolled ? "auto" : "none" }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center hover:opacity-80 transition-opacity shrink-0 text-gray-600 font-bold uppercase text-xs">
                    {language}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer">EN</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('ar')} className="cursor-pointer">AR</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('hi')} className="cursor-pointer">HI</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-[#009744] flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
                aria-label="Support"
              >
                <Headphones className="h-4 md:h-5 w-4 md:w-5 text-white" />
              </button>

              <Link href="/wishlist">
                <button
                  className="flex items-center justify-center hover:text-pink-500 transition-colors shrink-0"
                  aria-label="Wishlist"
                >
                  <Heart className="h-5 md:h-6 w-5 md:w-6 text-gray-600" />
                </button>
              </Link>
              {isLoggedIn ? (
                <div className="group relative">
                  <Link href="/account">
                    <button
                      className="flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
                      aria-label="Account"
                    >
                      <User className="h-5 md:h-6 w-5 md:w-6 text-gray-600" />
                    </button>
                  </Link>
                  {/* Hover Dropdown Logout */}
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 z-50">
                    <button
                      onClick={() => {
                        logout();
                        router.push("/");
                      }}
                      className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm font-medium rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/login">
                  <button
                    className="flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
                    aria-label="Login"
                  >
                    <User className="h-5 md:h-6 w-5 md:w-6 text-gray-600" />
                  </button>
                </Link>
              )}
            </div>

            {/* Mobile: Hamburger menu with dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9 md:h-10 md:w-10 shrink-0"
                  aria-label="Menu"
                >
                  <Menu className="h-4 md:h-5 w-4 md:w-5 text-gray-900" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200">
                <DropdownMenuLabel className="text-gray-900">Language</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer text-gray-900 hover:bg-gray-100">English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ar')} className="cursor-pointer text-gray-900 hover:bg-gray-100">العربية</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('hi')} className="cursor-pointer text-gray-900 hover:bg-gray-100">हिंदी</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200" />

                {isLoggedIn ? (
                  <>
                    <DropdownMenuLabel className="text-gray-900">
                      {user?.name || t('nav.account')}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/account"
                        className="flex items-center gap-2 cursor-pointer text-gray-900 hover:bg-gray-100 focus:bg-gray-100"
                      >
                        <User className="h-4 w-4 text-gray-600" />
                        <span>My Account</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem
                      onClick={() => {
                        logout();
                        router.push("/");
                      }}
                      className="flex items-center gap-2 cursor-pointer text-red-600 hover:bg-gray-100 focus:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel className="text-gray-900">Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/login"
                        className="flex items-center gap-2 cursor-pointer text-gray-900 hover:bg-gray-100 focus:bg-gray-100"
                      >
                        <User className="h-4 w-4 text-gray-600" />
                        <span>Login</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-gray-900 hover:bg-gray-100 focus:bg-gray-100">
                  <Link href="/wishlist" className="flex items-center gap-2 w-full">
                    <Heart className="h-4 w-4 text-gray-600" />
                    <span>{t('product.wishlist')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem asChild>
                  <Link
                    href="/support"
                    className="flex items-center gap-2 cursor-pointer text-gray-900 hover:bg-gray-100 focus:bg-gray-100"
                  >
                    <Headphones className="h-4 w-4 text-gray-600" />
                    <span>{t('header.support')}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-1 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity shrink-0"
              aria-label="Shopping cart"
            >
              {!isScrolled ? (
                <>
                  <div className="relative">
                    <ShoppingCart className="h-5 md:h-6 w-5 md:w-6 text-[#009744]" />
                    {cartCount > 0 && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#AB1F23] flex items-center justify-center">
                        <span className="text-xs font-bold text-white leading-none">{cartCount > 9 ? "9+" : cartCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-xs font-medium text-gray-700 uppercase leading-tight">{t('nav.cart')}</span>
                    <span className="text-xs font-semibold text-gray-900 leading-tight">
                      {cartTotal > 0 ? formatCurrency(convertCurrency(cartTotal, 'AED')) : formatCurrency(0)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="relative">
                  <ShoppingCart className="h-5 md:h-6 w-5 md:w-6 text-[#009744]" />
                  {cartCount > 0 && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#AB1F23] flex items-center justify-center">
                      <span className="text-xs font-bold text-white leading-none">{cartCount > 9 ? "9+" : cartCount}</span>
                    </div>
                  )}
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      <CartSheet />
    </>
  );
}
