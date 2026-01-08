"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Filter } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Slider } from "@/src/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/src/components/ui/sheet";
import { useCartStore } from "@/src/lib/cart-store";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { searchProducts, filterProducts, mockProductsWithVariants, type SearchFilters } from "@/src/lib/products";
import Link from "next/link";

export function SearchPageContent() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <SearchPageContentInner />;
}

function SearchPageContentInner() {
  const { t, formatCurrency } = useI18n();
  const router = useRouter();
  const { addItem } = useCartStore();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    priceRange: [0, 1000],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  // Get all unique values for filters
  const allCategories = Array.from(new Set(mockProductsWithVariants.map((p) => p.category)));
  const allOrigins = Array.from(new Set(mockProductsWithVariants.map((p) => p.origin)));
  const allCertifications = Array.from(
    new Set(mockProductsWithVariants.flatMap((p) => p.certifications))
  );

  // Apply search and filters
  const filteredProducts = useMemo(() => {
    let results = mockProductsWithVariants;

    if (query) {
      results = searchProducts(query, results);
    }

    results = filterProducts(results, filters);
    
    // Apply sorting
    if (sortBy === "price-low") {
      results = [...results].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      results = [...results].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      results = [...results].sort((a, b) => b.rating - a.rating);
    }
    
    return results;
  }, [query, filters, sortBy]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-white via-white to-[#009744]/5 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight font-heading">
              {query ? (
                <>
                  <span className="text-gray-900">{t('search.resultsFor')}</span>
                  <span className="text-[#009744]"> {query}</span>
                </>
              ) : (
                <span className="text-gray-900">{t('common.allProducts') || 'All Products'}</span>
              )}
            </h1>
            <div className="flex items-center gap-2">
              <div className="h-[2px] w-8 bg-gradient-to-r from-[#009744] to-transparent" />
              <p className="text-sm sm:text-base text-gray-600 font-body">
                {t('search.showing')}: <span className="font-semibold text-gray-900">{filteredProducts.length}</span> {filteredProducts.length === 1 ? t('common.product') : t('common.products')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-gray-50 rounded-2xl border border-gray-200 p-5 sm:p-6 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-brand">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 font-heading">{t('common.filter')}</h2>
                <button onClick={() => setFilters({ priceRange: [0, 1000] })} className="text-xs font-semibold text-[#009744] hover:text-[#2E763B] transition-colors">
                  {t('common.reset')}
                </button>
              </div>
              <FilterSidebar
                filters={filters}
                onFiltersChange={setFilters}
                categories={allCategories}
                origins={allOrigins}
                certifications={allCertifications}
                t={t}
              />
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Mobile Filter and Sort */}
            <div className="lg:hidden flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center justify-center gap-2 border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold">
                    <Filter className="h-4 w-4" />
                    {t('common.filter')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-80 bg-white">
                  <SheetHeader>
                    <SheetTitle className="text-gray-900">{t('common.filter')}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar
                      filters={filters}
                      onFiltersChange={setFilters}
                      categories={allCategories}
                      origins={allOrigins}
                      certifications={allCertifications}
                      t={t}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 bg-white hover:border-[#009744] focus:outline-none focus:ring-2 focus:ring-[#009744] focus:border-transparent transition-colors"
                >
                  <option value="featured">{t('sort.featured') || 'Featured'}</option>
                  <option value="price-low">{t('sort.priceLow') || 'Price: Low to High'}</option>
                  <option value="price-high">{t('sort.priceHigh') || 'Price: High to Low'}</option>
                  <option value="rating">{t('sort.rating') || 'Rating'}</option>
                </select>
              </div>
            </div>

            {/* Desktop Sort */}
            <div className="hidden lg:flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div />
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{t('common.sort')}:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 bg-white hover:border-[#009744] focus:outline-none focus:ring-2 focus:ring-[#009744] focus:border-transparent transition-colors"
                >
                  <option value="featured">{t('sort.featured') || 'Featured'}</option>
                  <option value="price-low">{t('sort.priceLow') || 'Price: Low to High'}</option>
                  <option value="price-high">{t('sort.priceHigh') || 'Price: High to Low'}</option>
                  <option value="rating">{t('sort.rating') || 'Rating'}</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 sm:py-24">
                <div className="inline-block p-4 sm:p-6 rounded-full bg-gray-100 mb-4 sm:mb-6">
                  <Filter className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 font-heading">
                  {t('search.noProducts') || 'No products found'}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
                  {t('search.tryAdjusting') || 'Try adjusting your filters or search terms'}
                </p>
                <Button onClick={() => router.push('/products')} className="bg-[#009744] hover:bg-[#2E763B] text-white font-semibold rounded-full px-6 sm:px-8 py-2 sm:py-3 transition-colors">
                  {t('search.browseAll') || 'Browse All Products'}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {filteredProducts.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <Card className="group overflow-hidden bg-white border-0 transition-all duration-300 shadow-sm hover:shadow-xl rounded-3xl flex flex-col h-full cursor-pointer">
                      {/* Image Container */}
                      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden flex-shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Badge */}
                        {product.badge && (
                          <Badge className={`absolute top-3 sm:top-4 left-3 sm:left-4 z-10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-white shadow-lg uppercase tracking-wide font-poppins ${
                            product.badge === "SALE" ? "bg-[#AB1F23]" :
                            product.badge === "HOT" ? "bg-orange-500" :
                            "bg-[#009744]"
                          }`}>
                            {product.badge}
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <CardContent className="p-3 xs:p-3.5 sm:p-4 space-y-2 xs:space-y-2.5 flex-1 flex flex-col">
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 xs:h-3.5 sm:h-4 w-3 xs:w-3.5 sm:w-4 ${
                                  i < Math.floor(product.rating)
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-200 fill-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">
                            ({product.reviews})
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xs xs:text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 min-h-[2rem] xs:min-h-[2.5rem] leading-snug font-poppins group-hover:text-[#009744] transition-colors">
                          {t(product.name) || product.name}
                        </h3>

                        {/* Meta */}
                        <p className="text-[10px] xs:text-xs sm:text-xs text-gray-500 font-body">
                          {product.origin}
                        </p>

                        {/* Price - Flex Grow */}
                        <div className="pt-1 xs:pt-2 mt-auto">
                          {product.originalPrice ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 font-heading">
                                {formatCurrency(product.price)}
                              </span>
                              <span className="text-[10px] xs:text-xs sm:text-sm text-gray-400 line-through font-body">
                                {formatCurrency(product.originalPrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 font-heading">
                              {formatCurrency(product.price)}
                            </span>
                          )}
                        </div>
                      </CardContent>

                      {/* Add to Cart Button */}
                      <CardFooter className="p-3 xs:p-3.5 sm:p-4 pt-1 xs:pt-2">
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            if (product.variants[0]) {
                              addItem({
                                id: `${product.id}-${product.variants[0].id}`,
                                name: `${product.name} - ${product.variants[0].size}`,
                                image: product.image,
                                price: product.variants[0].price,
                                originalPrice: product.variants[0].originalPrice,
                                packageSize: product.variants[0].size,
                              });
                            }
                          }}
                          disabled={!product.inStock}
                          className="w-full bg-[#009744] hover:bg-[#2E763B] text-white font-semibold rounded-full py-2 xs:py-2.5 sm:py-3 text-xs xs:text-sm sm:text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {product.inStock ? t("product.addToCart") : t("product.outOfStock")}
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FilterSidebarProps {
  filters: Partial<SearchFilters>;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  categories: string[];
  origins: string[];
  certifications: string[];
  t: (key: string) => string;
}

function FilterSidebar({
  filters,
  onFiltersChange,
  categories,
  origins,
  certifications,
  t,
}: FilterSidebarProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Price Filter */}
      <div className="pb-5 border-b border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">{t("filter.priceRange")}</h3>
        <Slider
          value={filters.priceRange || [0, 1000]}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              priceRange: [value[0], value[1]] as [number, number],
            })
          }
          min={0}
          max={1000}
          step={10}
          className="mb-4 [&_[role=slider]]:bg-[#009744] [&>div>div]:bg-[#009744]"
        />
        <div className="flex justify-between text-xs sm:text-sm text-gray-600 font-medium">
          <span>AED {filters.priceRange?.[0] || 0}</span>
          <span>AED {filters.priceRange?.[1] || 1000}</span>
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="pb-5 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">{t('filter.category') || 'Category'}</h3>
          <div className="space-y-2.5">
            {categories.map((category) => (
              <label key={category} className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={filters.categories?.includes(category) || false}
                  onCheckedChange={(checked) => {
                    const current = filters.categories || [];
                    onFiltersChange({
                      ...filters,
                      categories: checked
                        ? [...current, category]
                        : current.filter((c) => c !== category),
                    });
                  }}
                  className="border-gray-300 data-[state=checked]:bg-[#009744] data-[state=checked]:border-[#009744] rounded"
                />
                <span className="text-xs sm:text-sm text-gray-700 group-hover:text-[#009744] transition-colors">{category}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Origin Filter */}
      {origins.length > 0 && (
        <div className="pb-5 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">{t('filter.origin') || 'Origin'}</h3>
          <div className="space-y-2.5">
            {origins.map((origin) => (
              <label key={origin} className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={filters.origins?.includes(origin) || false}
                  onCheckedChange={(checked) => {
                    const current = filters.origins || [];
                    onFiltersChange({
                      ...filters,
                      origins: checked
                        ? [...current, origin]
                        : current.filter((o) => o !== origin),
                    });
                  }}
                  className="border-gray-300 data-[state=checked]:bg-[#009744] data-[state=checked]:border-[#009744] rounded"
                />
                <span className="text-xs sm:text-sm text-gray-700 group-hover:text-[#009744] transition-colors">{origin}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Certification Filter */}
      {certifications.length > 0 && (
        <div className="pb-5 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">{t('filter.certification') || 'Certifications'}</h3>
          <div className="space-y-2.5">
            {certifications.map((cert) => (
              <label key={cert} className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={filters.certifications?.includes(cert) || false}
                  onCheckedChange={(checked) => {
                    const current = filters.certifications || [];
                    onFiltersChange({
                      ...filters,
                      certifications: checked
                        ? [...current, cert]
                        : current.filter((c) => c !== cert),
                    });
                  }}
                  className="border-gray-300 data-[state=checked]:bg-[#009744] data-[state=checked]:border-[#009744] rounded"
                />
                <span className="text-xs sm:text-sm text-gray-700 group-hover:text-[#009744] transition-colors">{cert}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Stock Filter */}
      <div className="pb-5 border-b border-gray-200">
        <label className="flex items-center gap-3 cursor-pointer group">
          <Checkbox
            checked={filters.inStockOnly || false}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, inStockOnly: checked as boolean })
            }
            className="border-gray-300 data-[state=checked]:bg-[#009744] data-[state=checked]:border-[#009744] rounded"
          />
          <span className="text-xs sm:text-sm font-medium text-gray-900">{t("filter.inStockOnly")}</span>
        </label>
      </div>

      {/* Sale Filter */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <Checkbox
            checked={filters.onSaleOnly || false}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, onSaleOnly: checked as boolean })
            }
            className="border-gray-300 data-[state=checked]:bg-[#AB1F23] data-[state=checked]:border-[#AB1F23] rounded"
          />
          <span className="text-xs sm:text-sm font-medium text-gray-900">{t('filter.onSaleOnly') || 'On Sale'}</span>
        </label>
      </div>
    </div>
  );
}
