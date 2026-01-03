"use client";

import { useState, useMemo } from "react";
import { Filter, X, Eye, Plus, Heart, Star, Check } from "lucide-react";
import { useCartStore } from "@/src/lib/cart-store.tsx";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Slider } from "@/src/components/ui/slider";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";
import { ProductModal } from "./ProductModal";
import { motion, AnimatePresence } from "framer-motion";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  packageSize: string;
  origin: string;
  certifications: string[];
  inStock: boolean;
  onSale: boolean;
  badge?: "SALE" | "HOT" | "NEW";
}

// Mock products data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Premium Kashmiri Almonds (Mamra)",
    image: "https://images.unsplash.com/photo-1508736793122-f516e3ba5569?w=400&h=400&fit=crop",
    price: 89.99,
    originalPrice: 109.99,
    discount: 18,
    rating: 4.9,
    reviews: 342,
    packageSize: "250g",
    origin: "Kashmir, India",
    certifications: ["Organic", "Non-GMO", "Raw and unprocessed"],
    inStock: true,
    onSale: true,
    badge: "SALE",
  },
  {
    id: "2",
    name: "California Almonds (Regular)",
    image: "https://images.unsplash.com/photo-1590434144548-16c4a9b5c365?w=400&h=400&fit=crop",
    price: 34.99,
    rating: 4.8,
    reviews: 289,
    packageSize: "500g",
    origin: "California, USA",
    certifications: ["Organic", "Non-GMO"],
    inStock: true,
    onSale: false,
  },
  {
    id: "3",
    name: "Roasted & Salted Almonds",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=400&fit=crop",
    price: 42.99,
    rating: 4.7,
    reviews: 198,
    packageSize: "400g",
    origin: "Turkey",
    certifications: ["Gluten-Free", "Vegan"],
    inStock: true,
    onSale: false,
    badge: "HOT",
  },
  {
    id: "4",
    name: "Premium Walnuts (Kashmiri)",
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop",
    price: 95.99,
    originalPrice: 120.99,
    discount: 21,
    rating: 4.9,
    reviews: 256,
    packageSize: "250g",
    origin: "Kashmir, India",
    certifications: ["Organic", "Raw and unprocessed"],
    inStock: true,
    onSale: true,
    badge: "SALE",
  },
  {
    id: "5",
    name: "Organic Cashews (Whole)",
    image: "https://images.unsplash.com/photo-1585705722479-48c8f6027270?w=400&h=400&fit=crop",
    price: 125.99,
    rating: 4.8,
    reviews: 312,
    packageSize: "500g",
    origin: "India",
    certifications: ["Organic", "Non-GMO", "Vegan"],
    inStock: true,
    onSale: false,
    badge: "NEW",
  },
  {
    id: "6",
    name: "Chilean Hazelnuts",
    image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400&h=400&fit=crop",
    price: 78.99,
    rating: 4.6,
    reviews: 145,
    packageSize: "1kg",
    origin: "Chile",
    certifications: ["Organic", "Gluten-Free"],
    inStock: true,
    onSale: false,
  },
  {
    id: "7",
    name: "Turkish Pistachios",
    image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400&h=400&fit=crop",
    price: 89.99,
    originalPrice: 110.99,
    discount: 19,
    rating: 4.7,
    reviews: 201,
    packageSize: "500g",
    origin: "Turkey",
    certifications: ["Non-GMO", "Vegan"],
    inStock: true,
    onSale: true,
  },
  {
    id: "8",
    name: "California Walnuts",
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop",
    price: 65.99,
    rating: 4.8,
    reviews: 278,
    packageSize: "1kg",
    origin: "California, USA",
    certifications: ["Organic", "Non-GMO", "Gluten-Free"],
    inStock: true,
    onSale: false,
  },
  {
    id: "9",
    name: "Kashmiri Saffron (Premium)",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=400&fit=crop",
    price: 299.99,
    rating: 5.0,
    reviews: 456,
    packageSize: "2g",
    origin: "Kashmir, India",
    certifications: ["Organic", "Raw and unprocessed"],
    inStock: true,
    onSale: false,
    badge: "NEW",
  },
  {
    id: "10",
    name: "Organic Raisins (Seedless)",
    image: "https://images.unsplash.com/photo-1508736793122-f516e3ba5569?w=400&h=400&fit=crop",
    price: 45.99,
    originalPrice: 55.99,
    discount: 18,
    rating: 4.6,
    reviews: 189,
    packageSize: "500g",
    origin: "Turkey",
    certifications: ["Organic", "Vegan", "Gluten-Free"],
    inStock: true,
    onSale: true,
  },
  {
    id: "11",
    name: "California Dates (Medjool)",
    image: "https://images.unsplash.com/photo-1590434144548-16c4a9b5c365?w=400&h=400&fit=crop",
    price: 89.99,
    rating: 4.9,
    reviews: 334,
    packageSize: "1kg",
    origin: "California, USA",
    certifications: ["Organic", "Vegan", "Raw and unprocessed"],
    inStock: true,
    onSale: false,
  },
  {
    id: "12",
    name: "Chilean Macadamia Nuts",
    image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400&h=400&fit=crop",
    price: 155.99,
    rating: 4.7,
    reviews: 167,
    packageSize: "500g",
    origin: "Chile",
    certifications: ["Organic", "Non-GMO"],
    inStock: true,
    onSale: false,
  },
  {
    id: "13",
    name: "Premium Mixed Nuts",
    image: "https://images.unsplash.com/photo-1508736793122-f516e3ba5569?w=400&h=400&fit=crop",
    price: 79.99,
    rating: 4.7,
    reviews: 234,
    packageSize: "250g",
    origin: "Kashmir, India",
    certifications: ["Organic", "Non-GMO"],
    inStock: true,
    onSale: true,
    badge: "NEW" as const,
  },
  {
    id: "14",
    name: "Premium Brazil Nuts",
    image: "https://images.unsplash.com/photo-1590434144548-16c4a9b5c365?w=400&h=400&fit=crop",
    price: 95.99,
    rating: 4.6,
    reviews: 189,
    packageSize: "500g",
    origin: "California, USA",
    certifications: ["Organic", "Non-GMO"],
    inStock: true,
    onSale: false,
  },
  {
    id: "15",
    name: "Honey Roasted Almonds",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=400&fit=crop",
    price: 52.99,
    rating: 4.8,
    reviews: 267,
    packageSize: "1kg",
    origin: "Turkey",
    certifications: ["Organic", "Non-GMO"],
    inStock: true,
    onSale: false,
  },
  {
    id: "16",
    name: "Premium Pine Nuts",
    image: "https://images.unsplash.com/photo-1585705722479-48c8f6027270?w=400&h=400&fit=crop",
    price: 185.99,
    rating: 4.9,
    reviews: 156,
    packageSize: "2kg",
    origin: "Chile",
    certifications: ["Organic", "Non-GMO"],
    inStock: true,
    onSale: true,
    badge: "NEW" as const,
  },
  {
    id: "17",
    name: "Salted Cashews",
    image: "https://images.unsplash.com/photo-1508736793122-f516e3ba5569?w=400&h=400&fit=crop",
    price: 68.99,
    rating: 4.5,
    reviews: 298,
    packageSize: "250g",
    origin: "Kashmir, India",
    certifications: ["Organic", "Non-GMO"],
    inStock: true,
    onSale: false,
  },
  {
    id: "18",
    name: "Raw Peanuts",
    image: "https://images.unsplash.com/photo-1590434144548-16c4a9b5c365?w=400&h=400&fit=crop",
    price: 32.99,
    rating: 4.6,
    reviews: 345,
    packageSize: "500g",
    origin: "California, USA",
    certifications: ["Organic", "Non-GMO"],
    inStock: true,
    onSale: true,
  },
  {
    id: "19",
    name: "Premium Pecans",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=400&fit=crop",
    price: 115.99,
    rating: 4.7,
    reviews: 178,
    packageSize: "1kg",
    origin: "Turkey",
    certifications: ["Organic", "Non-GMO"],
    inStock: true,
    onSale: false,
  },
  {
    id: "20",
    name: "Organic Sunflower Seeds",
    image: "https://images.unsplash.com/photo-1585705722479-48c8f6027270?w=400&h=400&fit=crop",
    price: 28.99,
    rating: 4.5,
    reviews: 412,
    packageSize: "2kg",
    origin: "Chile",
    certifications: ["Organic", "Non-GMO"],
    inStock: true,
    onSale: false,
    badge: "NEW" as const,
  },
  {
    id: "21",
    name: "Dried Apricots",
    image: "https://images.unsplash.com/photo-1508736793122-f516e3ba5569?w=400&h=400&fit=crop",
    price: 48.99,
    rating: 4.8,
    reviews: 223,
    packageSize: "250g",
    origin: "Kashmir, India",
    certifications: ["Organic", "Non-GMO"],
    inStock: true,
    onSale: true,
  },
  {
    id: "22",
    name: "Dried Figs",
    image: "https://images.unsplash.com/photo-1590434144548-16c4a9b5c365?w=400&h=400&fit=crop",
    price: 56.99,
    rating: 4.6,
    reviews: 187,
    packageSize: "500g",
    origin: "California, USA",
    certifications: ["Organic", "Non-GMO"],
    inStock: true,
    onSale: false,
  },
  {
    id: "23",
    name: "Pumpkin Seeds",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=400&fit=crop",
    price: 35.99,
    rating: 4.7,
    reviews: 289,
    packageSize: "1kg",
    origin: "Turkey",
    certifications: ["Organic", "Non-GMO"],
    inStock: true,
    onSale: false,
  },
  {
    id: "24",
    name: "Chia Seeds",
    image: "https://images.unsplash.com/photo-1585705722479-48c8f6027270?w=400&h=400&fit=crop",
    price: 42.99,
    rating: 4.9,
    reviews: 367,
    packageSize: "2kg",
    origin: "Chile",
    certifications: ["Organic", "Non-GMO"],
    inStock: true,
    onSale: true,
    badge: "NEW" as const,
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
    priceRange: [0, 400],
    packageSizes: [],
    origins: [],
    certifications: [],
    inStockOnly: false,
    onSaleOnly: false,
  });

  const [priceInputs, setPriceInputs] = useState<[number, number]>([0, 400]);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      priceRange: [0, 400],
      packageSizes: [],
      origins: [],
      certifications: [],
      inStockOnly: false,
      onSaleOnly: false,
    });
    setPriceInputs([0, 400]);
  };

  const packageSizes = ["250g", "500g", "1kg", "2kg"];
  const origins = ["Kashmir, India", "California, USA", "Turkey", "Chile"];
  const certifications = [
    "Organic",
    "Non-GMO",
    "Gluten-Free",
    "Vegan",
    "Raw and unprocessed",
  ];

  const FilterContent = ({ className = "" }: { className?: string }) => (
    <div className={cn("space-y-6", className)}>
      {/* Filter Header - Only for mobile sheet */}
      <div className="flex items-center justify-between pb-5 border-b border-gray-100 lg:hidden">
        <div className="flex items-center gap-2.5">
          <Filter className="h-5 w-5 text-[#009744]" />
          <h3 className="text-lg font-bold text-gray-900 font-poppins">Filters</h3>
        </div>
        <button
          onClick={resetFilters}
          className="text-sm text-[#009744] hover:text-[#2E763B] transition-colors font-semibold font-poppins"
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
            max={400}
            step={10}
            className="w-full [&_[role=slider]]:bg-[#009744] [&_[role=slider]]:border-[#009744] [&>div>div]:bg-[#009744]"
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wide">Min</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">AED</span>
                <Input
                  type="number"
                  value={priceInputs[0]}
                  onChange={(e) => handlePriceInputChange(0, e.target.value)}
                  className="border-gray-300 focus:border-[#009744] focus:ring-[#009744] pl-12"
                  min={0}
                  max={400}
                />
              </div>
            </div>
            <div className="flex-1">
              <Label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wide">Max</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">AED</span>
                <Input
                  type="number"
                  value={priceInputs[1]}
                  onChange={(e) => handlePriceInputChange(1, e.target.value)}
                  className="border-gray-300 focus:border-[#009744] focus:ring-[#009744] pl-12"
                  min={0}
                  max={400}
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
                  className="border-gray-300 data-[state=checked]:bg-[#009744] data-[state=checked]:border-[#009744] rounded"
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
                  className="border-gray-300 data-[state=checked]:bg-[#009744] data-[state=checked]:border-[#009744] rounded"
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
                  className="border-gray-300 data-[state=checked]:bg-[#009744] data-[state=checked]:border-[#009744] rounded"
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
              className="border-gray-300 data-[state=checked]:bg-[#009744] data-[state=checked]:border-[#009744] rounded"
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
              className="border-gray-300 data-[state=checked]:bg-[#009744] data-[state=checked]:border-[#009744] rounded"
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
    </div>
  );

  return (
    <section className="w-full py-12 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-5 font-heading text-center lg:text-left">
            <span className="text-[#AB1F23]">Our Premium</span>{" "}
            <span className="text-[#009744]">Products</span>
          </h2>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-[2px] bg-gradient-to-b from-[#AB1F23] to-[#009744] rounded-full hidden lg:block" />
              <p className="text-sm md:text-lg text-gray-500 max-w-2xl font-body italic tracking-wide text-center lg:text-left">
                Handpicked, organic, and packed with goodness — find your favorite natural delights here.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Mobile Filter Trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden flex items-center gap-2 rounded-full h-12 px-6 border-gray-300">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <SheetHeader className="text-left mb-6">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <FilterContent />
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-4 flex-1 sm:flex-none">
                <span className="text-sm md:text-lg text-gray-900 font-semibold font-body whitespace-nowrap">Sort by:</span>
                <div className="relative group flex-1 sm:flex-none">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none w-full sm:w-auto px-6 md:px-8 py-3 md:py-3.5 pr-12 md:pr-14 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#009744] bg-white text-sm md:text-base font-semibold font-poppins text-gray-900 cursor-pointer hover:border-[#009744] transition-all duration-300 shadow-sm hover:shadow-md min-w-[140px] md:min-w-[180px]"
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

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filter Sidebar - Desktop Only */}
          <aside className="hidden lg:block lg:w-72 lg:flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-brand">
              <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <Filter className="h-5 w-5 text-[#009744]" />
                  <h3 className="text-lg font-bold text-gray-900 font-poppins">Filters</h3>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-sm text-[#009744] hover:text-[#2E763B] transition-colors font-semibold font-poppins"
                >
                  Clear all
                </button>
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results count */}
            <div className="mb-8 flex items-center justify-between">
              <p className="text-sm text-gray-600 font-body">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> of{" "}
                <span className="font-semibold text-gray-900">{mockProducts.length}</span> products
              </p>
            </div>

<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
              <div className="mt-20 text-center">
                <Button
                  size="lg"
                  className="group relative bg-[#009744] hover:bg-[#2E763B] text-white px-16 py-8 text-lg font-bold rounded-full shadow-[0_10px_20px_-5px_rgba(0,151,68,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(0,151,68,0.4)] transition-all duration-500 font-poppins overflow-hidden border-2 border-white/10"
                >
                  <span className="relative z-10 flex items-center gap-3">
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
      className="group overflow-hidden bg-white border-0 transition-all duration-300 shadow-sm hover:shadow-xl rounded-3xl cursor-pointer"
      onClick={() => onProductClick(product)}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
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

      <CardContent className="p-5 space-y-3">
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

<CardFooter className="p-5 pt-0">
          <Button
            className={cn(
              "w-full font-bold h-12 rounded-full transition-all shadow-md hover:shadow-lg group/btn font-poppins",
              isInCart || isAdding
                ? "bg-[#009744] hover:bg-[#2E763B] text-white"
                : "bg-[#009744] hover:bg-[#2E763B] text-white"
            )}
            onClick={handleAddToCart}
          >
            {isAdding ? (
              <>
                <Check className="h-5 w-5 mr-2 animate-bounce" />
                Added!
              </>
            ) : isInCart ? (
              <>
                <Plus className="h-5 w-5 mr-2 group-hover/btn:rotate-90 transition-transform" />
                Add More
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2 group-hover/btn:rotate-90 transition-transform" />
                Add to Cart
              </>
            )}
          </Button>
        </CardFooter>
    </Card>
  );
}
