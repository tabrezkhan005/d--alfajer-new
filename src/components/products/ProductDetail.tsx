"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Heart, Share2, Check, AlertCircle, Plus, Minus, ThumbsUp, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { motion } from "framer-motion";
import { useCartStore } from "@/src/lib/cart-store";
import { mockProductsWithVariants } from "@/src/lib/products";
import { useI18n } from "@/src/components/providers/i18n-provider";

interface ProductDetailProps {
  productId: string;
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ProductDetailContent productId={productId} />;
}

function ProductDetailContent({ productId }: ProductDetailProps) {
  const router = useRouter();
  const { t, formatCurrency } = useI18n();
  const { addItem } = useCartStore();

  const product = useMemo(
    () => mockProductsWithVariants.find((p) => p.id === productId),
    [productId]
  );

  const [selectedVariantId, setSelectedVariantId] = useState(
    product?.variants[0]?.id || ""
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) {
    return <div className="p-8 text-center">{t("product.notFound")}</div>;
  }

  const selectedVariant = product.variants.find(
    (v) => v.id === selectedVariantId
  );
  const displayPrice = selectedVariant?.price || product.price;
  const displayOriginalPrice = selectedVariant?.originalPrice || product.originalPrice;

  const handleAddToCart = () => {
    if (selectedVariant) {
      // Add item quantity times
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: `${product.id}-${selectedVariant.id}-${Date.now()}-${i}`,
          name: `${product.name} - ${selectedVariant.size}`,
          image: product.image,
          price: selectedVariant.price,
          originalPrice: selectedVariant.originalPrice,
          packageSize: selectedVariant.size,
        });
      }
      setQuantity(1);
    }
  };

  const handleBuyNow = () => {
    if (selectedVariant) {
      // Navigate to checkout with product ID (without adding to cart)
      router.push(`/checkout?product=${product.id}`);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.images[selectedImageIndex]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.badge && (
              <Badge className="absolute top-4 left-4 bg-red-500">
                {product.badge}
              </Badge>
            )}
          </div>
          
          {/* Thumbnail Grid */}
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-full aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                  selectedImageIndex === idx
                    ? "border-amber-600"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name}-${idx}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6 text-gray-900">
          {/* Title & Rating */}
          <div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={
                      i < Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-gray-700">
                {product.rating} ({product.reviews} {t("product.reviews")})
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(displayPrice)}
              </span>
              {displayOriginalPrice && (
                <span className="text-lg text-gray-500 line-through">
                  {formatCurrency(displayOriginalPrice)}
                </span>
              )}
            </div>
            {displayOriginalPrice && (
              <p className="text-sm text-green-600">
                Save {formatCurrency(displayOriginalPrice - displayPrice)}
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {selectedVariant && selectedVariant.stock > 0 ? (
              <>
                <Check size={20} className="text-green-600" />
                <span className="text-green-600 font-medium">
                  {t("product.inStock")}
                </span>
              </>
            ) : (
              <>
                <AlertCircle size={20} className="text-red-600" />
                <span className="text-red-600 font-medium">
                  {t("product.outOfStock")}
                </span>
              </>
            )}
          </div>

          {/* Variant Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              {t("product.selectVariant")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all text-gray-900 ${
                    selectedVariantId === variant.id
                      ? "border-amber-600 bg-amber-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${variant.stock === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={variant.stock === 0}
                >
                  <div>{variant.size}</div>
                  <div className="text-xs text-gray-600">
                    {formatCurrency(variant.price)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">{t('product.quantity')}</label>
            <div className="flex items-center gap-4 w-fit">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-white bg-white"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={16} />
              </Button>
              <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-white bg-white"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock === 0}
                >
                  {t("product.addToCart")}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={handleBuyNow}
                  disabled={!selectedVariant || selectedVariant.stock === 0}
                >
                  <Zap size={18} className="mr-2" />
                  {t("product.buyNow")}
                </Button>
              </motion.div>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="w-full text-gray-900 hover:bg-white bg-white"
              onClick={() => setIsWishlisted(!isWishlisted)}
            >
              <Heart
                size={20}
                className={isWishlisted ? "fill-red-500 text-red-500" : ""}
              />
              {isWishlisted ? t('product.removeWishlist') : t('product.wishlist')}
            </Button>
          </div>

          {/* Share */}
          <Button
            variant="outline"
            className="w-full text-gray-900 hover:bg-white bg-white"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: product.name,
                  text: product.shortDescription,
                  url: window.location.href,
                });
              }
            }}
          >
            <Share2 size={18} className="mr-2" />
            {t('product.share')}
          </Button>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl mb-1">🚚</div>
              <p className="text-sm font-medium text-gray-900">{t('product.freeShipping')}</p>
              <p className="text-xs text-gray-700">{t('product.onOrders')}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🔒</div>
              <p className="text-sm font-medium text-gray-900">{t('product.securePayment')}</p>
              <p className="text-xs text-gray-700">{t('product.ssl')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mt-12 text-gray-900">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200">
          <TabsTrigger value="description" className="text-gray-900 data-[state=active]:bg-gray-100">{t('product.description')}</TabsTrigger>
          <TabsTrigger value="nutrition" className="text-gray-900 data-[state=active]:bg-gray-100">{t('product.nutrition')}</TabsTrigger>
          <TabsTrigger value="reviews" className="text-gray-900 data-[state=active]:bg-gray-100">{t('product.reviews')}</TabsTrigger>
          <TabsTrigger value="shipping" className="text-gray-900 data-[state=active]:bg-gray-100">Shipping</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-4 text-gray-900 bg-white p-6 rounded-b-lg border border-t-0 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">{t('product.aboutProduct')}</h3>
          <p className="text-gray-700 leading-relaxed">{product.longDescription}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-gray-900">{t('product.origin')}</h4>
              <p className="text-gray-800">{product.origin}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-900">{t('product.certifications')}</h4>
              <div className="flex flex-wrap gap-2">
                {product.certifications.map((cert) => (
                  <Badge key={cert} variant="outline" className="text-gray-900 border-gray-900">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {product.ingredients.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-gray-900">{t('product.ingredients')}</h4>
              <ul className="space-y-1">
                {product.ingredients.map((ing, idx) => (
                  <li key={idx} className="text-sm text-gray-800">
                    • {ing}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4 text-gray-900 bg-white p-6 rounded-b-lg border border-t-0 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">{t('product.nutritionInfo')}</h3>
          <p className="text-sm text-gray-600">
            {t('product.perServing')}
          </p>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span>{t('product.calories')}</span>
                  <span className="font-semibold">
                    {product.nutritionFacts.calories} kcal
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>{t('product.protein')}</span>
                  <span className="font-semibold">
                    {product.nutritionFacts.protein}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>{t('product.fat')}</span>
                  <span className="font-semibold">
                    {product.nutritionFacts.fat}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>{t('product.carbohydrates')}</span>
                  <span className="font-semibold">
                    {product.nutritionFacts.carbs}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span>{t('product.fiber')}</span>
                  <span className="font-semibold">
                    {product.nutritionFacts.fiber}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4 text-gray-900 bg-white p-6 rounded-b-lg border border-t-0 border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-900">{t('product.customerReviews')}</h3>
          
          {/* Rating Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold mb-2 text-gray-900">{product.rating}</div>
                <div className="flex justify-center mb-2 gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.floor(product.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-700">{product.reviews} reviews</p>
              </CardContent>
            </Card>
          </div>

          {/* Sample Reviews */}
          <div className="space-y-4">
            {[
              { author: 'John Doe', rating: 5, title: 'Excellent quality!', comment: 'Great color and flavor.' },
              { author: 'Jane Smith', rating: 4, title: 'Good value', comment: 'Good product quality.' },
            ].map((review, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900">{review.title}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{review.author}</p>
                  <p className="text-gray-800">{review.comment}</p>
                  <Button variant="outline" size="sm" className="mt-2 gap-2">
                    <ThumbsUp size={14} />
                    Helpful
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button size="lg" className="w-full">
            {t('product.writeReview')}
          </Button>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4 text-gray-900 bg-white p-6 rounded-b-lg border border-t-0 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">{t('product.shippingInfo')}</h3>
          <div className="space-y-3 text-gray-800">
            <p>{t('product.standardShipping')}</p>
            <p>{t('product.expressShipping')}</p>
            <p>{t('product.overnightShipping')}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
