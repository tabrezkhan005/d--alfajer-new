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
    return results;
  }, [query, filters]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {query ? `Search Results for "${query}"` : "All Products"}
          </h1>
          <p className="text-gray-600">
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              categories={allCategories}
              origins={allOrigins}
              certifications={allCertifications}
            />
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Filter size={18} className="mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-96">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={allCategories}
                  origins={allOrigins}
                  certifications={allCertifications}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-lg font-semibold mb-2">No products found</p>
                  <p className="text-gray-600">
                    Try adjusting your filters or search terms
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="flex flex-col hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-0 flex-1">
                      <Link href={`/products/${product.id}`}>
                        <div className="relative w-full aspect-square bg-gray-100 overflow-hidden rounded-t-lg">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform"
                          />
                          {product.badge && (
                            <Badge className="absolute top-2 left-2 bg-red-500">
                              {product.badge}
                            </Badge>
                          )}
                        </div>
                      </Link>

                      <div className="p-3">
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-semibold text-sm line-clamp-2 hover:text-amber-600">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-1 my-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={
                                  i < Math.floor(product.rating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">
                            ({product.reviews})
                          </span>
                        </div>

                        <div className="space-y-1">
                          {product.originalPrice ? (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">
                                {formatCurrency(product.price)}
                              </span>
                              <span className="text-xs text-gray-500 line-through">
                                {formatCurrency(product.originalPrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-sm">
                              {formatCurrency(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-3 pt-0">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
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
                      >
                        {product.inStock ? "Add to Cart" : "Out of Stock"}
                      </Button>
                    </CardFooter>
                  </Card>
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
}

function FilterSidebar({
  filters,
  onFiltersChange,
  categories,
  origins,
  certifications,
}: FilterSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Price Filter */}
      <div>
        <h3 className="font-bold mb-4">Price Range</h3>
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
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>${filters.priceRange?.[0] || 0}</span>
          <span>${filters.priceRange?.[1] || 1000}</span>
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div>
          <h3 className="font-bold mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center gap-2 cursor-pointer">
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
                />
                <span className="text-sm">{category}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Origin Filter */}
      {origins.length > 0 && (
        <div>
          <h3 className="font-bold mb-3">Origin</h3>
          <div className="space-y-2">
            {origins.map((origin) => (
              <label key={origin} className="flex items-center gap-2 cursor-pointer">
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
                />
                <span className="text-sm">{origin}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Certification Filter */}
      {certifications.length > 0 && (
        <div>
          <h3 className="font-bold mb-3">Certifications</h3>
          <div className="space-y-2">
            {certifications.map((cert) => (
              <label key={cert} className="flex items-center gap-2 cursor-pointer">
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
                />
                <span className="text-sm">{cert}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Stock Filter */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={filters.inStockOnly || false}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, inStockOnly: checked as boolean })
            }
          />
          <span className="text-sm font-medium">In Stock Only</span>
        </label>
      </div>

      {/* Sale Filter */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={filters.onSaleOnly || false}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, onSaleOnly: checked as boolean })
            }
          />
          <span className="text-sm font-medium">On Sale</span>
        </label>
      </div>
    </div>
  );
}
