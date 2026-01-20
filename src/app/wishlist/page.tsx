"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { useWishlistStore } from "@/src/lib/wishlist-store";
import { useCartStore } from "@/src/lib/cart-store";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { useAuth } from "@/src/lib/auth-context";
import { motion } from "framer-motion";

export default function WishlistPage() {
  const { items, removeItem, getTotalItems } = useWishlistStore();
  const { addItem } = useCartStore();
  const { t, formatCurrency } = useI18n();
  const { user, isLoggedIn } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // Show login prompt if user is not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-[#009744] transition-colors">
                {t("common.home")}
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{t("product.wishlist")}</span>
            </div>
          </div>
        </div>

        {/* Login Required Section */}
        <div className="max-w-7xl mx-auto px-4 py-12 pt-16 sm:pt-20 lg:pt-24">
          <div className="text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-center">
                <div className="relative">
                  <Heart size={80} className="text-gray-200" />
                  <Lock size={40} className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 text-[#AB1F23]" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Access Your Wishlist
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                  Sign in to your account to view and manage your wishlist. Save your favorite products and get notified about price changes.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button className="bg-[#009744] hover:bg-[#007A37] text-white font-semibold h-12 px-8 rounded-lg">
                    Sign In to Your Account
                    <ArrowRight size={20} className="ml-2" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="border-2 border-gray-300 hover:border-[#009744] text-gray-900 font-semibold h-12 px-8 rounded-lg">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
              <p className="text-gray-600 mt-8">
                Don't have an account?{" "}
                <Link href="/login" className="text-[#009744] hover:underline font-semibold">
                  Create one now
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      originalPrice: item.originalPrice,
      packageSize: "Default",
    }, true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors">
              {t("common.home")}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{t("product.wishlist")}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 pt-16 sm:pt-20 lg:pt-24">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Heart size={32} className="text-[#AB1F23] fill-[#AB1F23]" />
            <h1 className="text-4xl font-bold text-gray-900">{t("product.wishlist")}</h1>
          </div>
          <p className="text-gray-600 text-lg">
            {getTotalItems()} {getTotalItems() === 1 ? t("common.product") : t("common.products")} {t("wishlist.inYourWishlist")}
          </p>
        </div>

        {/* Wishlist Items */}
        {items.length === 0 ? (
          <div className="text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-center">
                <Heart size={64} className="text-gray-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t("wishlist.empty")}
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {t("wishlist.emptyDescription")}
                </p>
              </div>
              <Link href="/products">
                <Button className="bg-[#009744] hover:bg-[#007A37] text-white font-semibold h-12 px-8 rounded-lg">
                  {t("wishlist.continueShopping")}
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <Link href={`/products/${item.id}`}>
                  <div className="relative aspect-square bg-gray-100 overflow-hidden group cursor-pointer">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {item.originalPrice && item.originalPrice > item.price && (
                      <Badge className="absolute top-4 left-4 bg-[#AB1F23] hover:bg-[#8B1819]">
                        SALE
                      </Badge>
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Name */}
                  <Link href={`/products/${item.id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-[#009744] transition-colors line-clamp-2">
                      {t(item.name)}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(item.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-gray-300 text-gray-300"
                            }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">({item.reviews})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(item.price)}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatCurrency(item.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <Button
                      onClick={() => handleAddToCart(item)}
                      className="w-full bg-[#009744] hover:bg-[#007A37] text-white font-semibold rounded-lg h-10"
                    >
                      <ShoppingCart size={18} className="mr-2" />
                      {t("wishlist.addToCart")}
                    </Button>
                    <Button
                      onClick={() => removeItem(item.id)}
                      className="w-full bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold rounded-lg h-10"
                    >
                      <Trash2 size={18} className="mr-2" />
                      {t("wishlist.remove")}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
