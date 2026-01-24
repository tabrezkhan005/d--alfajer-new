"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Heart, Share2 } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { useCartStore } from "@/src/lib/cart-store";
import { useWishlistStore } from "@/src/lib/wishlist-store";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

export function ProductCardComponent({ product }: { product: any }) {
  const { t, formatCurrency } = useI18n();
  const { addItem, isInCart: checkInCart } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const selectedVariantId = product.variants && product.variants.length > 0
      ? (product.variants.find((v: any) => v.is_default)?.id || product.variants[0].id)
      : "";

  const selectedVariant = product.variants?.find((v: any) => v.id === selectedVariantId) || product.variants?.[0];

  const displayPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
  const displayOriginalPrice = selectedVariant ? Number(selectedVariant.originalPrice) : Number(product.originalPrice);

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedVariant && (!product.variants || product.variants.length === 0)) {
       setIsAdding(true);
       addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        image: product.image,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        packageSize: product.packageSize,
       });
       setTimeout(() => setIsAdding(false), 1000);
       return;
    }

    if (selectedVariant) {
        setIsAdding(true);
        addItem({
            id: `${product.id}-${selectedVariant.id}`,
            productId: product.id,
            variantId: selectedVariant.id,
            name: `${product.name} - ${selectedVariant.size}`,
            image: product.image,
            price: Number(selectedVariant.price),
            originalPrice: selectedVariant.originalPrice ? Number(selectedVariant.originalPrice) : undefined,
            packageSize: selectedVariant.size,
        });
        setTimeout(() => setIsAdding(false), 1000);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      image: product.image,
      price: displayPrice,
      originalPrice: displayOriginalPrice,
      rating: product.rating,
      reviews: product.reviews,
    });
  };

  return (
    <Card className="group relative border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl overflow-hidden bg-white h-full flex flex-col cursor-pointer" onClick={() => router.push(`/products/${product.slug}`)}>
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        {product.badge && (
          <div className="absolute top-2 left-2 z-20">
            <Badge
              className={cn(
                "rounded-full px-2 py-1 text-xs font-bold shadow-sm backdrop-blur-md",
                product.badge === "SALE" && "bg-red-500 text-white",
                product.badge === "HOT" && "bg-orange-500 text-white",
                product.badge === "NEW" && "bg-green-600 text-white"
              )}
            >
              {product.badge}
            </Badge>
          </div>
        )}

        <motion.div className="absolute top-2 right-2 z-20">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleWishlist}
            className="rounded-full bg-white/80 hover:bg-white backdrop-blur-sm shadow-sm h-8 w-8"
          >
            <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"} />
          </Button>
        </motion.div>

        <Image
          src={product.image || "/images/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 bg-gradient-to-t from-black/50 to-transparent">
           <Button
             className="w-full bg-white text-black hover:bg-green-600 hover:text-white transition-colors shadow-lg font-medium"
             onClick={handleAddToCart}
           >
             {isAdding ? "Added!" : t("product.addToCart")}
           </Button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
           <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 text-sm sm:text-base">
             {product.name}
           </h3>
        </div>

        <div className="flex items-center gap-1 mb-2">
           <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
           <span className="text-xs font-semibold">{product.rating}</span>
           <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>

        <div className="mt-auto flex items-baseline gap-2">
           <span className="text-lg font-bold text-gray-900">{formatCurrency(displayPrice)}</span>
           {displayOriginalPrice > displayPrice && (
              <span className="text-xs text-gray-400 line-through">{formatCurrency(displayOriginalPrice)}</span>
           )}
        </div>
      </div>
    </Card>
  );
}
