"use client";

import { useState, useMemo } from "react";
import { Filter, X, Eye, Plus, Heart, Star, Check } from "lucide-react";
import { useCartStore } from "@/src/lib/cart-store";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Slider } from "@/src/components/ui/slider";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/src/components/ui/sheet";
import { cn } from "@/src/lib/utils";
import { ProductModal } from "./ProductModal";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  name: string;
  image: string;
  images?: string[];
  videos?: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  packageSize: string;
  origin: string;
  description: string;
  certifications: string[];
  inStock: boolean;
  onSale: boolean;
  badge?: "SALE" | "HOT" | "NEW";
}

// Products data from images folder
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Premium Chilli Powder",
    image: "/images/products/chillipowder/chillipowder_main.jpeg",
    images: [
      "/images/products/chillipowder/chillipowder_main.jpeg",
      "/images/products/chillipowder/chillipowder_1.jpeg",
      "/images/products/chillipowder/chillipowder_2.jpeg",
      "/images/products/chillipowder/chillipowder_3.jpeg",
      "/images/products/chillipowder/chillipowder4.jpeg",
      "/images/products/chillipowder/chillipowder5.jpeg",
      "/images/products/chillipowder/chillipowder6.jpeg",
      "/images/products/chillipowder/chillipowder7.jpeg",
    ],
    price: 24.99,
    originalPrice: 29.99,
    discount: 17,
    rating: 4.8,
    reviews: 156,
    packageSize: "250g",
    origin: "India",
    certifications: ["Organic", "Non-GMO", "Gluten-Free"],
    inStock: true,
    onSale: true,
    badge: "SALE",
    description: "Premium quality chilli powder made from carefully selected red chillies. Rich in flavor and perfect heat level for all your culinary needs. Naturally processed without any additives or preservatives.",
  },
  {
    id: "2",
    name: "Pure Natural Honey",
    image: "/images/products/honey/honey_main.jpeg",
    images: [
      "/images/products/honey/honey_main.jpeg",
      "/images/products/honey/honey1.jpeg",
      "/images/products/honey/honey2.jpeg",
      "/images/products/honey/honey3.jpeg",
      "/images/products/honey/honey5.jpeg",
    ],
    videos: [
      "/images/products/honey/honey4.mp4",
    ],
    price: 89.99,
    originalPrice: 109.99,
    discount: 18,
    rating: 4.9,
    reviews: 289,
    packageSize: "500g",
    origin: "UAE",
    certifications: ["Organic", "Raw and unprocessed", "Pure"],
    inStock: true,
    onSale: true,
    badge: "HOT",
    description: "100% pure natural honey sourced directly from local beekeepers. Unprocessed and unfiltered to preserve all natural enzymes and health benefits. Rich, golden color with authentic floral taste.",
  },
  {
    id: "3",
    name: "Kashmiri Tea (Premium)",
    image: "/images/products/kashmir tea/kashmir_main.jpeg",
    images: [
      "/images/products/kashmir tea/kashmir_main.jpeg",
      "/images/products/kashmir tea/kashmir1.jpeg",
      "/images/products/kashmir tea/kashmir2.jpeg",
      "/images/products/kashmir tea/kashmir3.jpeg",
      "/images/products/kashmir tea/kashmir4.jpeg",
      "/images/products/kashmir tea/kashmir5.jpeg",
      "/images/products/kashmir tea/kashmir6.jpeg",
      "/images/products/kashmir tea/kashmir7.jpeg",
    ],
    videos: [
      "/images/products/kashmir tea/kashmir3.5.mp4",
    ],
    price: 45.99,
    rating: 4.7,
    reviews: 198,
    packageSize: "250g",
    origin: "Kashmir, India",
    certifications: ["Organic", "Premium Grade", "Traditional"],
    inStock: true,
    onSale: false,
    badge: "NEW",
    description: "Authentic Kashmiri tea made from the finest tea leaves grown in the pristine valleys of Kashmir. Known for its rich aroma, smooth flavor, and traditional brewing method. A perfect blend of tradition and quality.",
  },
  {
    id: "4",
    name: "Shilajit (Premium Resin)",
    image: "/images/products/shirajit/shilajit_main.jpeg",
    images: [
      "/images/products/shirajit/shilajit_main.jpeg",
      "/images/products/shirajit/shilajit1.jpeg",
      "/images/products/shirajit/shilajit2.jpeg",
      "/images/products/shirajit/shilajit3.jpeg",
      "/images/products/shirajit/shilajit4.jpeg",
    ],
    price: 149.99,
    originalPrice: 179.99,
    discount: 17,
    rating: 4.9,
    reviews: 234,
    packageSize: "50g",
    origin: "Himalayas",
    certifications: ["Organic", "Pure", "Authentic"],
    inStock: true,
    onSale: true,
    badge: "HOT",
    description: "Premium quality Shilajit resin sourced from the pristine Himalayan mountains. Pure, authentic, and rich in fulvic acid and essential minerals. Known for its traditional health benefits and natural energy support.",
  },
];

interface FilterState {
  priceRange: [number, number];
  packageSizes: string[];
  origins: string[];
  certifications: string[];
  inStockOnly: boolean;
  onSaleOnly: boolean;
}

export function ProductListing() {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 200],
    packageSizes: [],
    origins: [],
    certifications: [],
    inStockOnly: false,
    onSaleOnly: false,
  });

  const [priceInputs, setPriceInputs] = useState<[number, number]>([0, 200]);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Auto-apply filters
  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      // Price filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Package size filter
      if (filters.packageSizes.length > 0 && !filters.packageSizes.includes(product.packageSize)) {
        return false;
      }

      // Origin filter
      if (filters.origins.length > 0 && !filters.origins.includes(product.origin)) {
        return false;
      }

      // Certifications filter
      if (filters.certifications.length > 0) {
        const hasCertification = filters.certifications.some((cert) =>
          product.certifications.includes(cert)
        );
        if (!hasCertification) return false;
      }

      // Availability filters
      if (filters.inStockOnly && !product.inStock) return false;
      if (filters.onSaleOnly && !product.onSale) return false;

      return true;
    });
  }, [filters]);

  const handlePriceRangeChange = (values: number[]) => {
    const newRange = [values[0], values[1]] as [number, number];
    setFilters((prev) => ({ ...prev, priceRange: newRange }));
    setPriceInputs(newRange);
  };

  const handlePriceInputChange = (index: 0 | 1, value: string) => {
    const numValue = parseInt(value) || 0;
    const newInputs: [number, number] = [...priceInputs];
    newInputs[index] = numValue;
    setPriceInputs(newInputs);
    setFilters((prev) => ({
      ...prev,
      priceRange: newInputs as [number, number],
    }));
  };

  const toggleFilter = (
    type: "packageSizes" | "origins" | "certifications",
    value: string
  ) => {
    setFilters((prev) => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const resetFilters = () => {
    setFilters({
      priceRange: [0, 200],
      packageSizes: [],
      origins: [],
      certifications: [],
      inStockOnly: false,
      onSaleOnly: false,
    });
    setPriceInputs([0, 200]);
    setIsFilterOpen(false);
  };

  const packageSizes = ["50g", "250g", "500g"];
  const origins = ["India", "UAE", "Kashmir, India", "Himalayas"];
  const certifications = [
    "Organic",
    "Non-GMO",
    "Gluten-Free",
    "Pure",
    "Raw and unprocessed",
    "Premium Grade",
    "Traditional",
    "Authentic",
  ];

  const renderFilterContent = () => (
    <>
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <Filter className="h-5 w-5 text-[#009744] flex-shrink-0" />
          <h3 className="text-lg font-bold text-gray-900 font-poppins">Filters</h3>
        </div>
        <button
          onClick={resetFilters}
          className="text-sm text-[#009744] hover:text-[#2E763B] transition-colors font-semibold font-poppins whitespace-nowrap"
          aria-label="Clear all filters"
        >
          Clear all
        </button>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Label className="text-base font-bold text-gray-900 font-poppins">
          Price Range
        </Label>
        <div className="space-y-4">
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceRangeChange}
            min={0}
            max={200}
            step={5}
            className="w-full [&_[role=slider]]:bg-[#009744] [&_[role=slider]]:border-[#009744] [&>div>div]:bg-[#009744]"
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wide">Min</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">AED</span>
                        <Input
                          type="number"
                          value={priceInputs[0]}
                          onChange={(e) => handlePriceInputChange(0, e.target.value)}
                          className="border-gray-300 focus:border-[#009744] focus:ring-[#009744] pl-12 text-sm"
                          min={0}
                          max={200}
                        />
              </div>
            </div>
            <div className="flex-1">
              <Label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wide">Max</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">AED</span>
                        <Input
                          type="number"
                          value={priceInputs[1]}
                          onChange={(e) => handlePriceInputChange(1, e.target.value)}
                          className="border-gray-300 focus:border-[#009744] focus:ring-[#009744] pl-12 text-sm"
                          min={0}
                          max={200}
                        />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Size */}
      <div className="space-y-3">
        <Label className="text-base font-bold text-gray-900 font-poppins">
          Package Size
        </Label>
        <div className="space-y-2.5">
          {packageSizes.map((size) => {
            const count = mockProducts.filter((p) => p.packageSize === size).length;
            return (
              <div key={size} className="flex items-center space-x-3 group/item">
                <Checkbox
                  id={`size-${size}`}
                  checked={filters.packageSizes.includes(size)}
                  onCheckedChange={() => toggleFilter("packageSizes", size)}
                  className="border-gray-300 data-[state=checked]:bg-[#009744] data-[state=checked]:border-[#009744] rounded h-4 w-4"
                />
                <Label
                  htmlFor={`size-${size}`}
                  className="text-sm text-gray-700 cursor-pointer flex-1 flex items-center justify-between group-hover/item:text-gray-900 transition-colors font-body"
                >
                  <span className="font-medium">{size}</span>
                  <span className="text-gray-400 text-xs font-normal">({count})</span>
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Origin */}
      <div className="space-y-3">
        <Label className="text-base font-bold text-gray-900 font-poppins">
          Origin
        </Label>
        <div className="space-y-2.5">
          {origins.map((origin) => {
            const count = mockProducts.filter((p) => p.origin === origin).length;
            return (
              <div key={origin} className="flex items-center space-x-3 group/item">
                <Checkbox
                  id={`origin-${origin}`}
                  checked={filters.origins.includes(origin)}
                  onCheckedChange={() => toggleFilter("origins", origin)}
                  className="border-gray-300 data-[state=checked]:bg-[#009744] data-[state=checked]:border-[#009744] rounded h-4 w-4"
                />
                <Label
                  htmlFor={`origin-${origin}`}
                  className="text-sm text-gray-700 cursor-pointer flex-1 flex items-center justify-between group-hover/item:text-gray-900 transition-colors font-body"
                >
                  <span className="font-medium">{origin}</span>
                  <span className="text-gray-400 text-xs font-normal">({count})</span>
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Certifications */}
      <div className="space-y-3">
        <Label className="text-base font-bold text-gray-900 font-poppins">
          Certifications
        </Label>
        <div className="space-y-2.5">
          {certifications.map((cert) => {
            const count = mockProducts.filter((p) =>
              p.certifications.includes(cert)
            ).length;
            return (
              <div key={cert} className="flex items-center space-x-3 group/item">
                <Checkbox
                  id={`cert-${cert}`}
                  checked={filters.certifications.includes(cert)}
                  onCheckedChange={() => toggleFilter("certifications", cert)}
                  className="border-gray-300 data-[state=checked]:bg-[#009744] data-[state=checked]:border-[#009744] rounded h-4 w-4"
                />
                <Label
                  htmlFor={`cert-${cert}`}
                  className="text-sm text-gray-700 cursor-pointer flex-1 flex items-center justify-between group-hover/item:text-gray-900 transition-colors font-body"
                >
                  <span className="font-medium">{cert}</span>
                  <span className="text-gray-400 text-xs font-normal">({count})</span>
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-3">
        <Label className="text-base font-bold text-gray-900 font-poppins">
          Availability
        </Label>
        <div className="space-y-2.5">
          <div className="flex items-center space-x-3 group/item">
            <Checkbox
              id="in-stock"
              checked={filters.inStockOnly}
              onCheckedChange={(checked) =>
                setFilters((prev) => ({ ...prev, inStockOnly: !!checked }))
              }
              className="border-gray-300 data-[state=checked]:bg-[#009744] data-[state=checked]:border-[#009744] rounded h-4 w-4"
            />
            <Label
              htmlFor="in-stock"
              className="text-sm text-gray-700 font-medium cursor-pointer group-hover/item:text-gray-900 transition-colors font-body"
            >
              In stock only
            </Label>
          </div>
          <div className="flex items-center space-x-3 group/item">
            <Checkbox
              id="on-sale"
              checked={filters.onSaleOnly}
              onCheckedChange={(checked) =>
                setFilters((prev) => ({ ...prev, onSaleOnly: !!checked }))
              }
              className="border-gray-300 data-[state=checked]:bg-[#009744] data-[state=checked]:border-[#009744] rounded h-4 w-4"
            />
            <Label
              htmlFor="on-sale"
              className="text-sm text-gray-700 font-medium cursor-pointer group-hover/item:text-gray-900 transition-colors font-body"
            >
              On sale
            </Label>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <section className="w-full py-12 sm:py-16 md:py-20 lg:py-28 bg-gray-50 overflow-x-hidden">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-8 sm:mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 font-heading">
            <span className="text-[#AB1F23]">Our Premium</span>{" "}
            <span className="text-[#009744]">Products</span>
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <div className="h-6 sm:h-8 w-[2px] bg-gradient-to-b from-[#AB1F23] to-[#009744] rounded-full hidden sm:block flex-shrink-0" />
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-500 max-w-2xl font-body italic tracking-wide">
                Handpicked, organic, and packed with goodness — find your favorite natural delights here.
              </p>
            </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
                  {/* Mobile: Sort by and Filters side by side */}
                  <div className="flex items-center gap-2 w-full sm:w-auto lg:hidden">
                    <span className="text-xs sm:text-sm text-gray-900 font-semibold font-body whitespace-nowrap">Sort by:</span>
                    <div className="relative group flex-1">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#009744] bg-white text-xs sm:text-sm font-semibold font-poppins text-gray-900 cursor-pointer hover:border-[#009744] transition-all duration-300 shadow-sm hover:shadow-md w-full"
                      >
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                        <option value="newest">Newest</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#009744] transition-colors">
                        <svg className="w-3 h-3 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                    </div>
                    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 hover:border-[#009744] hover:bg-[#009744] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md font-semibold font-poppins text-xs sm:text-sm"
                          aria-label="Open filters"
                        >
                          <Filter className="h-4 w-4" />
                          Filters
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-full sm:w-[90vw] sm:max-w-md overflow-y-auto bg-white [&>button]:text-gray-900 [&>button]:hover:text-gray-700">
                        <SheetHeader>
                          <SheetTitle className="text-left flex items-center gap-2 text-gray-900">
                            <Filter className="h-5 w-5 text-[#009744]" />
                            Filters
                          </SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 space-y-6">
                          {renderFilterContent()}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                  {/* Desktop: Sort by only */}
                  <div className="hidden lg:flex items-center gap-4">
                    <span className="text-sm md:text-base lg:text-lg text-gray-900 font-semibold font-body whitespace-nowrap">Sort by:</span>
                    <div className="relative group">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none px-8 py-3.5 pr-14 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#009744] bg-white text-sm md:text-base font-semibold font-poppins text-gray-900 cursor-pointer hover:border-[#009744] transition-all duration-300 shadow-sm hover:shadow-md min-w-[180px]"
                      >
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                        <option value="newest">Newest</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#009744] transition-colors">
                        <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                    </div>
                  </div>
              </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Filter Sidebar - Hidden on mobile, visible on desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-brand">
              {renderFilterContent()}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results count */}
            <div className="mb-6 sm:mb-8 flex items-center justify-between">
              <p className="text-xs sm:text-sm text-gray-600 font-body">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> of{" "}
                <span className="font-semibold text-gray-900">{mockProducts.length}</span> products
              </p>
            </div>

<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onProductClick={handleProductClick} />
                ))}
              </div>

              {/* Product Modal */}
              <ProductModal
                product={selectedProduct}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
              />

            {/* View All Products Button */}
            {filteredProducts.length > 0 && (
              <div className="mt-12 sm:mt-16 md:mt-20 text-center">
                <Button
                  size="lg"
                  className="group relative bg-[#009744] hover:bg-[#2E763B] text-white px-8 sm:px-16 py-6 sm:py-8 text-sm sm:text-base md:text-lg font-bold rounded-full shadow-[0_10px_20px_-5px_rgba(0,151,68,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(0,151,68,0.4)] transition-all duration-500 font-poppins overflow-hidden border-2 border-white/10 w-full sm:w-auto"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                    Load More Products
                    <Plus className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Button>
              </div>
            )}

            {/* No Results */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Filter className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                    No products found
                  </h3>
                  <p className="text-base text-gray-600 mb-8 font-body">
                    Try adjusting your filters to find what you're looking for.
                  </p>
                  <Button
                    onClick={resetFilters}
                    className="bg-[#009744] hover:bg-[#2E763B] text-white font-bold rounded-full px-8 py-3 font-poppins"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, onProductClick }: { product: Product; onProductClick: (product: Product) => void }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, items } = useCartStore();

  const isInCart = items.some((item) => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      packageSize: product.packageSize,
    });
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <Card
      className="group overflow-hidden bg-white border-0 transition-all duration-300 shadow-sm hover:shadow-xl rounded-3xl cursor-pointer flex flex-col h-full"
      onClick={() => onProductClick(product)}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden flex-shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badge */}
        {product.badge && (
          <Badge
            className={cn(
              "absolute top-4 left-4 z-10 px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg uppercase tracking-wide font-poppins",
              product.badge === "SALE" && "bg-[#AB1F23]",
              product.badge === "HOT" && "bg-orange-500",
              product.badge === "NEW" && "bg-[#009744]"
            )}
          >
            {product.badge}
          </Badge>
        )}

        {product.discount && !product.badge && (
          <Badge className="absolute top-4 left-4 z-10 bg-[#AB1F23] text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg font-poppins">
            -{product.discount}%
          </Badge>
        )}

  {/* Wishlist Button */}
          <motion.div
            className="absolute top-4 right-4 z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-11 w-11 rounded-full bg-white/95 hover:bg-white backdrop-blur-sm transition-all shadow-lg border border-gray-100",
                isWishlisted && "bg-pink-50 border-pink-100"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setIsWishlisted(!isWishlisted);
              }}
              aria-label="Add to wishlist"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isWishlisted ? "active" : "inactive"}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isWishlisted ? "fill-pink-500 text-pink-500" : "text-gray-600"
                    )}
                  />
                </motion.div>
              </AnimatePresence>
            </Button>
          </motion.div>

        {/* Quick View - Shows on hover */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-20 pb-5 px-5">
          <Button
            variant="secondary"
            size="sm"
            className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold shadow-lg rounded-full h-11 font-poppins"
          >
            <Eye className="h-4 w-4 mr-2" />
            Quick View
          </Button>
        </div>
      </div>

      <CardContent className="p-5 space-y-3 flex-1 flex flex-col">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => {
              const isFilled = i < Math.floor(product.rating);
              const isHalfFilled = i === Math.floor(product.rating) && product.rating % 1 >= 0.5;
              return (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    isFilled || isHalfFilled
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-200 fill-gray-200"
                  )}
                />
              );
            })}
          </div>
          <span className="text-sm text-gray-500 font-body">
            ({product.reviews})
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 min-h-[3rem] leading-snug font-poppins">
          {product.name}
        </h3>

        {/* Package Size */}
        <p className="text-sm text-gray-500 font-body">
          {product.packageSize}
        </p>

        {/* Price */}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-2xl font-bold text-gray-900 font-heading">
            AED {product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through font-body">
              AED {product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>

<CardFooter className="p-5 pt-0 mt-auto flex-shrink-0">
          <Button
            className={cn(
              "w-full font-bold rounded-full transition-all shadow-md hover:shadow-lg group/btn font-poppins",
              "h-10 sm:h-12 text-xs sm:text-sm px-3 sm:px-6",
              "flex items-center justify-center gap-1.5 sm:gap-2",
              isInCart || isAdding
                ? "bg-[#009744] hover:bg-[#2E763B] text-white"
                : "bg-[#009744] hover:bg-[#2E763B] text-white"
            )}
            onClick={handleAddToCart}
          >
            {isAdding ? (
              <>
                <Check className="h-3.5 w-3.5 sm:h-5 sm:w-5 animate-bounce shrink-0" />
                <span className="whitespace-nowrap">Added!</span>
              </>
            ) : isInCart ? (
              <>
                <Plus className="h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0 group-hover/btn:rotate-90 transition-transform" />
                <span className="whitespace-nowrap">Add More</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0 group-hover/btn:rotate-90 transition-transform" />
                <span className="whitespace-nowrap">Add to Cart</span>
              </>
            )}
          </Button>
        </CardFooter>
    </Card>
  );
}
