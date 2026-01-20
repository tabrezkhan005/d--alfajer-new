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
import { X, Loader2 } from "lucide-react";
import { useCartStore } from "@/src/lib/cart-store";
import { CartSheet } from "@/src/components/cart";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { useAuth } from "@/src/lib/auth-context";

interface ProductRecommendation {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  category: string;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [productRecommendations, setProductRecommendations] = useState<ProductRecommendation[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const { items, openCart, getTotalItems, getTotalPrice } = useCartStore();
  const { t, formatCurrency, convertCurrency, currency, language, setLanguage } = useI18n();
  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch product recommendations
  useEffect(() => {
    if (!isSearchOpen || !searchQuery || searchQuery.length < 2) {
      setProductRecommendations([]);
      return;
    }

    const fetchRecommendations = async () => {
      setIsLoadingSearch(true);
      try {
        const response = await fetch(
          `/api/autocomplete?q=${encodeURIComponent(searchQuery)}&limit=6`
        );
        const data = await response.json();
        if (data.products) {
          setProductRecommendations(data.products);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setIsLoadingSearch(false);
      }
    };

    const timer = setTimeout(fetchRecommendations, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleProductClick = (slug: string) => {
    router.push(`/products/${slug}`);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

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
        <div className="relative mx-auto w-full max-w-[1920px] px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Mobile: Flex Layout */}
          <div className="flex md:hidden items-center justify-between w-full">
            {/* Logo - Left */}
            <Link href="/" aria-label="Home" className="shrink-0 flex items-center">
              <Image
                src="/images/alfajernewlogo.jpeg"
                alt="Al Fajer Mart"
                width={80}
                height={26}
                className="object-contain"
                priority
              />
            </Link>

            {/* Mobile: Search, Menu, Cart Icons */}
            {!isSearchOpen ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  aria-label="Search"
                  onClick={() => {
                    setIsSearchOpen(true);
                    setTimeout(() => {
                      const input = document.getElementById('mobile-search-input') as HTMLInputElement;
                      input?.focus();
                    }, 100);
                  }}
                >
                  <Search className="h-5 w-5 text-gray-900" />
                </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5 text-gray-900" />
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

            <button
              onClick={openCart}
              className="relative flex items-center cursor-pointer hover:opacity-80 transition-opacity shrink-0"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5 text-[#009744]" />
              {cartCount > 0 && (
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#AB1F23] flex items-center justify-center">
                  <span className="text-xs font-bold text-white leading-none">{cartCount > 9 ? "9+" : cartCount}</span>
                </div>
              )}
            </button>
              </div>
            ) : (
              /* Mobile Search Overlay */
              <div className="fixed top-6 xs:top-7 sm:top-8 md:top-9 left-0 right-0 z-50 bg-white border-b flex flex-col shadow-lg" style={{ height: '80px' }}>
                <div className="flex items-center gap-2 px-3 py-2">
                  <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="mobile-search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('common.search')}
                        className="pl-10 pr-4 h-10 rounded-full border-gray-300 focus:border-[#009744] focus:ring-[#009744]"
                        autoFocus
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                        setProductRecommendations([]);
                      }}
                      aria-label="Close search"
                    >
                      <X className="h-5 w-5 text-gray-900" />
                    </Button>
                  </form>
                </div>

                {/* Product Recommendations */}
                {(isLoadingSearch || productRecommendations.length > 0) && (
                  <div className="border-t border-gray-200 bg-white max-h-[calc(100vh-180px)] overflow-y-auto fixed top-[104px] xs:top-[105px] sm:top-[106px] md:top-[107px] left-0 right-0 z-40">
                    {isLoadingSearch ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-[#009744]" />
                      </div>
                    ) : productRecommendations.length > 0 ? (
                      <div className="p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          {t('common.search')} Results
                        </h3>
                        {productRecommendations.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleProductClick(product.slug)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                              {product.image ? (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Search className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {product.category}
                              </p>
                              <p className="text-sm font-semibold text-[#009744] mt-1">
                                {formatCurrency(convertCurrency(product.price, 'INR'))}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid grid-cols-3 w-full items-center">
            {/* Logo - Left */}
            <div className="flex items-center justify-start">
              <Link href="/" aria-label="Home" className="shrink-0 flex items-center ml-12 md:ml-16 lg:ml-24 xl:ml-28">
                <Image
                  src="/images/alfajernewlogo.jpeg"
                  alt="Al Fajer Mart"
                  width={200}
                  height={75}
                  className="object-contain h-14 md:h-16 lg:h-18"
                  priority
                />
              </Link>
            </div>

            {/* Search Bar - Center */}
            <div className="flex items-center justify-center">
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
            <div className="col-start-3 flex items-center justify-end gap-2 sm:gap-3 lg:gap-4">
            {/* Desktop: Actions */}
            <div className="hidden lg:flex items-center gap-3 lg:gap-4">
              {/* Support */}
              <div className="group relative flex items-center">
                <Link href="/support" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="h-8 w-8 rounded-full bg-[#009744] flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                </Link>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                  {t('header.support')}
                </span>
              </div>

              {/* Wishlist */}
              <div className="group relative flex items-center">
                <Link href="/wishlist" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <Heart className="h-5 md:h-6 w-5 md:w-6 text-gray-600 group-hover:text-pink-500 transition-colors" />
                </Link>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                  {t('product.wishlist')}
                </span>
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
                  </Link>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                    Login
                  </span>
                </div>
              )}
              </div>

              {/* Cart button - Desktop */}
              <button
                onClick={openCart}
                className="relative flex items-center cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 md:h-6 w-5 md:w-6 text-[#009744]" />
                {cartCount > 0 && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#AB1F23] flex items-center justify-center">
                    <span className="text-xs font-bold text-white leading-none">{cartCount > 9 ? "9+" : cartCount}</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <CartSheet />
    </>
  );
}
