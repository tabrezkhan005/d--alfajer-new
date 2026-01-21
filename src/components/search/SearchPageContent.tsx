"use client";

import { useState, useEffect } from "react";
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
import { searchProducts, getCategories, type ProductWithVariants } from "@/src/lib/supabase/products";
import Link from "next/link";

interface SearchFilters {
  priceRange: [number, number];
  categories: string[];
  origins: string[];
  certifications: string[];
  inStockOnly: boolean;
  onSaleOnly: boolean;
}

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
  const categoryFromUrl = searchParams.get("category") || "";

  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [categoryInitialized, setCategoryInitialized] = useState(false);

  // Static options for now (could be fetched from DB facets)
  const allOrigins = ["Kashmir, India", "UAE", "Himalayas", "India"];
  const allCertifications = ["Organic", "Raw", "Unfiltered", "Non-GMO", "Gluten-Free"];

  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    priceRange: [0, 10000],
    categories: [],
    origins: [],
    certifications: [],
    inStockOnly: false,
    onSaleOnly: false
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  // Fetch categories on mount
  useEffect(() => {
    getCategories().then(cats => {
      setAvailableCategories(cats.map(c => c.name));
    });
  }, []);

  // Apply category from URL once categories are loaded
  useEffect(() => {
    if (categoryFromUrl && availableCategories.length > 0 && !categoryInitialized) {
      // Find matching category by name (case-insensitive)
      const matchedCategory = availableCategories.find(
        cat => cat.toLowerCase() === categoryFromUrl.toLowerCase() ||
          cat.toLowerCase().replace(/[&\s]+/g, '-') === categoryFromUrl.toLowerCase().replace(/[&\s]+/g, '-')
      );
      if (matchedCategory) {
        setFilters(f => ({ ...f, categories: [matchedCategory] }));
      }
      setCategoryInitialized(true);
    }
  }, [categoryFromUrl, availableCategories, categoryInitialized]);

  // Fetch products when query or filters change
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const fetchProducts = async () => {
      const results = await searchProducts(query, {
        priceRange: filters.priceRange as [number, number],
        categories: filters.categories,
        origins: filters.origins,
        certifications: filters.certifications,
        inStockOnly: filters.inStockOnly,
        onSaleOnly: filters.onSaleOnly,
        sortBy
      });

      if (!isCancelled) {
        setProducts(results);
        setIsLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isCancelled = true;
    };
  }, [query, filters, sortBy]);

  return (
    <div className="min-h-screen bg-white pt-28 sm:pt-32 md:pt-36 lg:pt-40">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-white via-white to-[#009744]/5 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-7 lg:px-8 py-6 xs:py-7 sm:py-8 md:py-10 lg:py-12">
          <div className="space-y-2 xs:space-y-2.5 sm:space-y-3">
            <h1 className="text-2xl xs:text-2.5xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight font-heading">
              {query ? (
                <>
                  <span className="text-gray-900">{t('search.resultsFor')}</span>
                  <span className="text-[#009744]"> {query}</span>
                </>
              ) : categoryFromUrl || filters.categories?.length ? (
                <span className="text-[#009744]">{filters.categories?.[0] || categoryFromUrl}</span>
              ) : (
                <span className="text-gray-900">{t('common.allProducts') || 'All Products'}</span>
              )}
            </h1>
            <div className="flex items-center gap-2">
              <div className="h-[2px] w-8 bg-gradient-to-r from-[#009744] to-transparent" />
              <p className="text-xs xs:text-xs sm:text-base text-gray-600 font-body">
                {isLoading ? t('common.loading') : (
                  <>
                    {t('search.showing')}: <span className="font-semibold text-gray-900">{products.length}</span> {products.length === 1 ? t('common.product') : t('common.products')}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-7 lg:px-8 py-6 xs:py-7 sm:py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 xs:gap-5 sm:gap-6 md:gap-7 lg:gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-gray-50 rounded-2xl border border-gray-200 p-5 xs:p-5.5 sm:p-6 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-brand">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                <h2 className="text-sm xs:text-base sm:text-lg font-bold text-gray-900 font-heading">{t('common.filter')}</h2>
                <button onClick={() => setFilters({ priceRange: [0, 10000] })} className="text-xs font-semibold text-[#009744] hover:text-[#2E763B] transition-colors">
                  {t('common.reset')}
                </button>
              </div>
              <FilterSidebar
                filters={filters}
                onFiltersChange={setFilters}
                categories={availableCategories}
                origins={allOrigins}
                certifications={allCertifications}
                t={t}
              />
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Mobile Filter and Sort */}
            <div className="lg:hidden flex flex-col xs:flex-col sm:flex-row gap-2 xs:gap-3 sm:gap-4 mb-5 xs:mb-6">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center justify-center gap-2 border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold text-xs xs:text-xs sm:text-sm">
                    <Filter className="h-4 w-4" />
                    {t('common.filter')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-80 bg-white p-3 xs:p-4">
                  <SheetHeader>
                    <SheetTitle className="text-gray-900 text-base xs:text-lg">{t('common.filter')}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar
                      filters={filters}
                      onFiltersChange={setFilters}
                      categories={availableCategories}
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
                  className="w-full px-3 xs:px-3.5 sm:px-4 py-2 xs:py-2.5 border border-gray-300 rounded-lg text-xs xs:text-xs sm:text-sm font-semibold text-gray-900 bg-white hover:border-[#009744] focus:outline-none focus:ring-2 focus:ring-[#009744] focus:border-transparent transition-colors"
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
                <span className="text-xs xs:text-xs sm:text-sm font-semibold text-gray-900">{t('common.sort')}:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 xs:px-3.5 sm:px-4 py-2 xs:py-2.5 border border-gray-300 rounded-lg text-xs xs:text-xs sm:text-sm font-semibold text-gray-900 bg-white hover:border-[#009744] focus:outline-none focus:ring-2 focus:ring-[#009744] focus:border-transparent transition-colors"
                >
                  <option value="featured">{t('sort.featured') || 'Featured'}</option>
                  <option value="price-low">{t('sort.priceLow') || 'Price: Low to High'}</option>
                  <option value="price-high">{t('sort.priceHigh') || 'Price: High to Low'}</option>
                  <option value="rating">{t('sort.rating') || 'Rating'}</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="text-center py-16">Loading products...</div>
            ) : products.length === 0 ? (
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
                {products.map((product) => (
                  <Link key={product.id} href={`/products/${product.slug || product.id}`}>
                    <Card className="group overflow-hidden bg-white border-0 transition-all duration-300 shadow-sm hover:shadow-xl rounded-3xl flex flex-col h-full cursor-pointer">
                      {/* Image Container */}
                      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0] || '/images/placeholder.jpg'}
                            alt={product.name}
                            fill
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                        )}

                        {/* Badge */}
                        {product.badge && (
                          <Badge className={`absolute top-3 sm:top-4 left-3 sm:left-4 z-10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-white shadow-lg uppercase tracking-wide font-poppins ${product.badge === "SALE" ? "bg-[#AB1F23]" :
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
                                className={`h-3 xs:h-3.5 sm:h-4 w-3 xs:w-3.5 sm:w-4 ${i < Math.floor(product.rating || 0)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-200 fill-gray-200"
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">
                            ({product.review_count || 0})
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xs xs:text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 min-h-[2rem] xs:min-h-[2.5rem] leading-snug font-poppins group-hover:text-[#009744] transition-colors">
                          {product.name}
                        </h3>

                        {/* Meta */}
                        <p className="text-[10px] xs:text-xs sm:text-xs text-gray-500 font-body">
                          {product.origin}
                        </p>

                        {/* Price - Flex Grow */}
                        <div className="pt-1 xs:pt-2 mt-auto">
                          {product.original_price ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 font-heading">
                                {formatCurrency(product.base_price || 0)}
                              </span>
                              <span className="text-[10px] xs:text-xs sm:text-sm text-gray-400 line-through font-body">
                                {formatCurrency(product.original_price)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 font-heading">
                              {formatCurrency(product.base_price || 0)}
                            </span>
                          )}
                        </div>
                      </CardContent>

                      {/* Add to Cart Button */}
                      <CardFooter className="p-3 xs:p-3.5 sm:p-4 pt-1 xs:pt-2">
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            if (product.variants && product.variants[0]) {
                              addItem({
                                id: `${product.id}-${product.variants[0].id}`,
                                name: `${product.name} - ${product.variants[0].weight || 'Standard'}`,
                                image: product.images?.[0] || '',
                                price: product.variants[0].price,
                                originalPrice: product.variants[0].compare_at_price || undefined,
                                packageSize: String(product.variants[0].weight || 'Standard'),
                              });
                            }
                          }}
                          disabled={!product.is_active} // Simplified stock check
                          className="w-full bg-[#009744] hover:bg-[#2E763B] text-white font-semibold rounded-full py-2 xs:py-2.5 sm:py-3 text-xs xs:text-sm sm:text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {product.is_active ? t("product.addToCart") : t("product.outOfStock")}
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
    <div className="space-y-4 xs:space-y-4.5 sm:space-y-5">
      {/* Price Filter */}
      <div className="pb-4 xs:pb-4.5 sm:pb-5 border-b border-gray-200">
        <h3 className="font-bold text-gray-900 mb-3 text-xs xs:text-xs sm:text-sm">{t("filter.priceRange")}</h3>
        <Slider
          value={filters.priceRange || [0, 10000]}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              priceRange: [value[0], value[1]] as [number, number],
            })
          }
          min={0}
          max={10000}
          step={10}
          className="mb-3 [&_[role=slider]]:bg-[#009744] [&>div>div]:bg-[#009744]"
        />
        <div className="flex justify-between text-xs text-gray-600 font-medium">
          <span>AED {filters.priceRange?.[0] || 0}</span>
          <span>AED {filters.priceRange?.[1] || 10000}</span>
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="pb-4 xs:pb-4.5 sm:pb-5 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 mb-2 xs:mb-2.5 sm:mb-3 text-xs xs:text-xs sm:text-sm">{t('filter.category') === 'filter.category' ? 'Category' : t('filter.category')}</h3>
          <div className="space-y-1.5 xs:space-y-2">
            {categories.map((category) => {
              const key = `category.${category.toLowerCase().replace(/\s+/g, '')}`;
              const translated = t(key);
              const label = translated === key ? category : translated;
              return (
                <label key={category} className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 cursor-pointer group">
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
                  <span className="text-xs text-gray-700 group-hover:text-[#009744] transition-colors">
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Origin Filter */}
      {origins.length > 0 && (
        <div className="pb-4 xs:pb-4.5 sm:pb-5 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 mb-2 xs:mb-2.5 sm:mb-3 text-xs xs:text-xs sm:text-sm">{t('filter.origin') === 'filter.origin' ? 'Origin' : t('filter.origin')}</h3>
          <div className="space-y-1.5 xs:space-y-2">
            {origins.map((origin) => {
              const key = `origin.${origin.toLowerCase().replace(/[,\s]+/g, '')}`;
              const translated = t(key);
              const label = translated === key ? origin : translated;
              return (
                <label key={origin} className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 cursor-pointer group">
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
                  <span className="text-xs text-gray-700 group-hover:text-[#009744] transition-colors">
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Certification Filter */}
      {certifications.length > 0 && (
        <div className="pb-4 xs:pb-4.5 sm:pb-5 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 mb-2 xs:mb-2.5 sm:mb-3 text-xs xs:text-xs sm:text-sm">{t('filter.certification') === 'filter.certification' ? 'Certifications' : t('filter.certification')}</h3>
          <div className="space-y-1.5 xs:space-y-2">
            {certifications.map((cert) => {
              const key = `cert.${cert.toLowerCase().replace(/[\s-]+/g, '')}`;
              const translated = t(key);
              const label = translated === key ? cert : translated;
              return (
                <label key={cert} className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 cursor-pointer group">
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
                  <span className="text-xs text-gray-700 group-hover:text-[#009744] transition-colors">
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Filter */}
      <div className="pb-4 xs:pb-4.5 sm:pb-5 border-b border-gray-200">
        <label className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 cursor-pointer group">
          <Checkbox
            checked={filters.inStockOnly || false}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, inStockOnly: checked as boolean })
            }
            className="border-gray-300 data-[state=checked]:bg-[#009744] data-[state=checked]:border-[#009744] rounded"
          />
          <span className="text-xs font-medium text-gray-900">{t("filter.inStockOnly")}</span>
        </label>
      </div>

      {/* Sale Filter */}
      <div>
        <label className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 cursor-pointer group">
          <Checkbox
            checked={filters.onSaleOnly || false}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, onSaleOnly: checked as boolean })
            }
            className="border-gray-300 data-[state=checked]:bg-[#AB1F23] data-[state=checked]:border-[#AB1F23] rounded"
          />
          <span className="text-xs font-medium text-gray-900">{t('filter.onSaleOnly') || 'On Sale'}</span>
        </label>
      </div>
    </div>
  );
}
