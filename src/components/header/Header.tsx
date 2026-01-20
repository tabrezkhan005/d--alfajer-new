"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Phone,
  Menu,
  LogOut,
} from "lucide-react";

import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
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
  const [mounted, setMounted] = useState(false);
  const { items, openCart, getTotalItems, getTotalPrice } = useCartStore();
  const { t, formatCurrency, convertCurrency, currency, language, setLanguage } = useI18n();
  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const cartCount = mounted ? getTotalItems() : 0;
  const cartTotal = mounted ? getTotalPrice() : 0;

  return (
    <>
      <header
        className="fixed top-6 xs:top-7 sm:top-8 md:top-9 left-0 right-0 z-40 flex items-center h-20 backdrop-blur-md border-b"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#E5E7EB",
        }}
      >
        <div className="relative mx-auto flex w-full max-w-[1920px] items-center justify-between px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Logo - Left */}
          <Link href="/" aria-label="Home" className="shrink-0 flex items-center">
            <div className="relative flex items-center justify-center rounded-full"
              style={{
                width: "clamp(50px, 10vw, 70px)",
                height: "clamp(50px, 10vw, 70px)",
                backgroundColor: "#f0f0f0",
                border: "2px solid #e5e7eb",
              }}>
              <Image
                src="/images/alfajernewlogo.jpeg"
                alt="Al Fajer Mart"
                width={110}
                height={25}
                className="object-contain"
                style={{
                  width: "clamp(40px, 8vw, 56px)",
                  height: "auto",
                }}
                priority
              />
            </div>
          </Link>

          {/* Search Bar - Center (hidden on mobile) */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-4 lg:mx-6">
            <form
              className="relative w-full max-w-md flex items-center"
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
                placeholder="Search for organic products, dry fruits..."
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

          {/* Right Actions - Support, Wishlist, Login, Cart */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Desktop: Actions */}
            <div className="hidden lg:flex items-center gap-3 lg:gap-4">
              {/* Support */}
              <div className="group relative flex items-center">
                <Link href="/support" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="h-8 w-8 rounded-full bg-[#009744] flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {t('header.support')}
                  </span>
                </Link>
              </div>

              {/* Wishlist */}
              <div className="group relative flex items-center">
                <Link href="/wishlist" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <Heart className="h-5 md:h-6 w-5 md:w-6 text-gray-600 group-hover:text-pink-500 transition-colors" />
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {t('product.wishlist')}
                  </span>
                </Link>
              </div>

              {/* Login/Account */}
              {isLoggedIn ? (
                <div className="group relative">
                  <Link href="/account" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <User className="h-5 md:h-6 w-5 md:w-6 text-gray-600" />
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
                <div className="group relative flex items-center">
                  <Link
                    href="/login"
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <User className="h-5 md:h-6 w-5 md:w-6 text-gray-600" />
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      Login
                    </span>
                  </Link>
                </div>
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
                    <Phone className="h-4 w-4 text-gray-600" />
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
              <div className="relative">
                <ShoppingCart className="h-5 md:h-6 w-5 md:w-6 text-[#009744]" />
                {cartCount > 0 && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#AB1F23] flex items-center justify-center">
                    <span className="text-xs font-bold text-white leading-none">{cartCount > 9 ? "9+" : cartCount}</span>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      <CartSheet />
    </>
  );
}
