"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/src/components/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Textarea } from "@/src/components/ui/textarea";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Star,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  Zap,
  Truck,
  Shield,
  Award,
  Play,
  Pause
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
  certifications: string[];
  inStock: boolean;
  onSale: boolean;
  badge?: "SALE" | "HOT" | "NEW";
  description?: string;
}

interface Review {
  id: string;
  user: string;
  avatar?: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  helpful: number;
  verified: boolean;
}

const mockReviews: Review[] = [
  {
    id: "1",
    user: "Sarah M.",
    rating: 5,
    date: "2024-01-15",
    title: "Absolutely fresh and delicious!",
    comment: "These are the best almonds I've ever tasted. You can tell they're truly premium quality. The packaging was excellent and they arrived fresh.",
    helpful: 24,
    verified: true,
  },
  {
    id: "2",
    user: "Ahmed K.",
    rating: 5,
    date: "2024-01-10",
    title: "Perfect for my family",
    comment: "We've been ordering from Al Fajer for months now. The quality is consistently excellent and the delivery is always on time.",
    helpful: 18,
    verified: true,
  },
  {
    id: "3",
    user: "Priya S.",
    rating: 4,
    date: "2024-01-05",
    title: "Great quality, slightly pricey",
    comment: "The product quality is outstanding. A bit expensive but you get what you pay for. Will definitely order again.",
    helpful: 12,
    verified: true,
  },
  {
    id: "4",
    user: "Mohammed R.",
    rating: 5,
    date: "2023-12-28",
    title: "Best in UAE!",
    comment: "I've tried many brands but Al Fajer is by far the best. The taste and freshness are unmatched. Highly recommend!",
    helpful: 31,
    verified: true,
  },
  {
    id: "5",
    user: "Lisa T.",
    rating: 3,
    date: "2023-12-20",
    title: "Good but expected more",
    comment: "The almonds are good quality but I expected them to be a bit larger given the premium price. Still tasty though.",
    helpful: 8,
    verified: false,
  },
];

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductModal({ product, open, onOpenChange }: ProductModalProps) {
  const router = useRouter();
  const { t, formatCurrency, convertCurrency, currency } = useI18n();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Combine images and videos into media array
  const allMedia = product ? [
    ...(product.images || [product.image]),
    ...(product.videos || []),
  ] : [];
  const selectedMedia = allMedia[selectedMediaIndex] || '';
  const isVideo = selectedMedia?.endsWith('.mp4');

  // Handle video play/pause
  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
        setShowPlayButton(true);
      } else {
        videoRef.current.play();
        setIsVideoPlaying(true);
        setShowPlayButton(false);
      }
    }
  };

  // Auto-play video when selected
  useEffect(() => {
    if (isVideo && videoRef.current && open && product) {
      videoRef.current.play().then(() => {
        setIsVideoPlaying(true);
        setShowPlayButton(false);
      }).catch(() => {
        setIsVideoPlaying(false);
        setShowPlayButton(true);
      });
    } else if (!isVideo) {
      setIsVideoPlaying(false);
      setShowPlayButton(false);
    }
  }, [selectedMediaIndex, isVideo, open, product]);

  // Show play button on hover or when paused
  useEffect(() => {
    if (isVideo) {
      setShowPlayButton(!isVideoPlaying || isHovering);
    }
  }, [isVideoPlaying, isHovering, isVideo]);

  // Reset video state when modal closes
  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsVideoPlaying(false);
      setShowPlayButton(true);
    }
  }, [open]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 bg-white rounded-lg sm:rounded-2xl lg:rounded-3xl border-0 shadow-2xl left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[calc(100vw-2rem)] sm:w-full sm:max-w-5xl mx-0 text-gray-900">
        <VisuallyHidden>
          <DialogTitle>{t(product.name)}</DialogTitle>
        </VisuallyHidden>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 text-gray-900">
          {/* Left: Product Image Gallery */}
          <div className="relative bg-[#FBFBFC] p-3 sm:p-4 lg:p-6 flex flex-col min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
            {product.badge && (
              <Badge
                className={cn(
                  "absolute top-3 sm:top-4 lg:top-6 left-3 sm:left-4 lg:left-6 z-10 px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-full text-xs sm:text-sm font-bold text-white shadow-lg uppercase tracking-wider font-poppins",
                  product.badge === "SALE" && "bg-[#AB1F23]",
                  product.badge === "HOT" && "bg-orange-500",
                  product.badge === "NEW" && "bg-[#009744]"
                )}
              >
                {product.badge === 'SALE' ? t('product.badge.sale') : product.badge === 'HOT' ? t('product.badge.hot') : t('product.badge.new')}
              </Badge>
            )}
            {product.discount && !product.badge && (
              <Badge className="absolute top-3 sm:top-4 lg:top-6 left-3 sm:left-4 lg:left-6 z-10 bg-[#AB1F23] text-white px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-lg font-poppins tracking-wider">
                -{product.discount}% OFF
              </Badge>
            )}

            {/* Main Media Display */}
            <div className="relative flex-1 flex items-center justify-center mb-3 sm:mb-4 rounded-lg overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedMediaIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {isVideo ? (
                    <div
                      className="relative w-full h-full max-h-[400px] sm:max-h-[500px] flex items-center justify-center group"
                      onMouseEnter={() => setIsHovering(true)}
                      onMouseLeave={() => setIsHovering(false)}
                    >
                      <video
                        ref={videoRef}
                        src={selectedMedia}
                        className="w-full h-full object-contain rounded-lg"
                        playsInline
                        autoPlay
                        muted
                        loop
                        onPlay={() => setIsVideoPlaying(true)}
                        onPause={() => setIsVideoPlaying(false)}
                      >
                        Your browser does not support the video tag.
                      </video>
                      {/* Custom Play/Pause Button - Only shows when paused or hovering */}
                      {showPlayButton && (
                        <button
                          onClick={handleVideoToggle}
                          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all duration-200 rounded-lg z-10"
                          aria-label={isVideoPlaying ? "Pause video" : "Play video"}
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-110">
                            {isVideoPlaying ? (
                              <Pause className="h-8 w-8 sm:h-10 sm:w-10 text-gray-900 ml-0.5" fill="currentColor" />
                            ) : (
                              <Play className="h-8 w-8 sm:h-10 sm:w-10 text-gray-900 ml-1" fill="currentColor" />
                            )}
                          </div>
                        </button>
                      )}
                    </div>
                  ) : selectedMedia ? (
                    <img
                      src={selectedMedia}
                      alt={`${product.name} - Image ${selectedMediaIndex + 1}`}
                      className="w-full h-full max-h-[400px] sm:max-h-[500px] object-contain drop-shadow-2xl rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full max-h-[400px] sm:max-h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Thumbnail Gallery */}
            {allMedia.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {allMedia.map((media, index) => {
                  const isVideoThumb = media.endsWith('.mp4');
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedMediaIndex(index)}
                      className={cn(
                        "flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all",
                        selectedMediaIndex === index
                          ? "border-[#009744] ring-2 ring-[#009744]/20"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {isVideoThumb ? (
                        <div className="relative w-full h-full bg-gray-100 flex items-center justify-center group">
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:bg-white transition-colors">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          <span className="absolute bottom-1 left-1 text-xs sm:text-sm text-gray-600 font-medium bg-white/80 px-1 rounded">VIDEO</span>
                        </div>
                      ) : (
                        <img
                          src={media}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/[0.02] to-transparent pointer-events-none" />
          </div>

          {/* Right: Product Info */}
          <div className="p-4 sm:p-8 lg:p-12 space-y-6 sm:space-y-8 bg-white">
            {/* Rating */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3 sm:h-4 sm:w-4",
                      i < Math.floor(product.rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200 fill-gray-200"
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-gray-900">{product.rating}</span>
                <span className="text-xs sm:text-sm text-gray-400 font-medium">({product.reviews} verified reviews)</span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 font-heading leading-tight tracking-tight">
                {t(product.name)}
              </h2>
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 text-xs sm:text-sm font-medium">
                <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-poppins">Origin: {product.origin}</span>
                <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-poppins">{product.packageSize}</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#009744] font-heading tracking-tight">
                {formatCurrency(convertCurrency(product.price, 'INR'))}
              </span>
              {product.originalPrice && (
                <span className="text-lg sm:text-xl text-gray-400 line-through font-body decoration-gray-300">
                  {formatCurrency(convertCurrency(product.originalPrice, 'INR'))}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-500 text-sm sm:text-base lg:text-lg leading-relaxed font-body">
              {product.description ? t(product.description) : `Premium quality ${t(product.name).toLowerCase()} sourced directly from ${product.origin}. Perfectly processed and packed to preserve natural flavor and nutrients.`}
            </p>

            {/* Certifications */}
            <div className="flex flex-wrap gap-2">
              {product.certifications.map((cert) => (
                <Badge
                  key={cert}
                  variant="outline"
                  className="bg-green-50 text-[#009744] border-[#009744]/20 font-medium px-3 py-1"
                >
                  <Check className="h-3 w-3 mr-1" />
                  {cert}
                </Badge>
              ))}
            </div>

            {/* Quantity Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <Label className="text-xs sm:text-sm font-semibold text-gray-700 font-poppins">Quantity:</Label>
              <div className="flex items-center border-2 border-gray-300 rounded-full overflow-hidden w-fit bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-11 sm:h-12 w-11 sm:w-12 flex items-center justify-center hover:bg-white active:bg-gray-100 transition-colors border-r border-gray-300"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" />
                </button>
                <span className="w-14 sm:w-16 text-center font-bold text-lg sm:text-xl font-poppins text-gray-900 bg-white py-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-11 sm:h-12 w-11 sm:w-12 flex items-center justify-center hover:bg-white active:bg-gray-100 transition-colors border-l border-gray-300"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 sm:gap-3 pt-4 w-full">
              <div className="flex gap-2 sm:gap-3 w-full">
                <Button
                  size="lg"
                  className="flex-1 bg-[#009744] hover:bg-[#00803a] text-white font-bold h-12 sm:h-14 rounded-full shadow-[0_4px_14px_0_rgba(0,151,68,0.39)] hover:shadow-[0_6px_20px_rgba(0,151,68,0.23)] transition-all duration-300 font-poppins text-sm sm:text-base active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{t("product.addToCart")}</span>
                </Button>
                <Button
                  size="lg"
                  onClick={() => {
                    router.push(`/checkout?product=${product.id}`);
                    onOpenChange(false);
                  }}
                  className="flex-1 bg-[#D1515A] hover:bg-[#B83E45] text-white font-bold h-12 sm:h-14 rounded-full shadow-[0_4px_14px_0_rgba(209,81,90,0.39)] hover:shadow-[0_6px_20px_rgba(209,81,90,0.23)] transition-all duration-300 font-poppins text-sm sm:text-base active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{t("product.buyNow")}</span>
                </Button>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={cn(
                    "h-12 sm:h-14 w-full sm:w-14 rounded-full border-2 transition-all bg-white",
                    isWishlisted
                      ? "bg-pink-50 border-pink-200 text-pink-500 shadow-[0_4px_14px_0_rgba(255,182,193,0.39)]"
                      : "border-gray-200 text-gray-600 hover:border-pink-200 hover:text-pink-500 hover:bg-pink-50/50 shadow-sm"
                  )}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isWishlisted ? "wishlisted" : "not-wishlisted"}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-center gap-2 w-full"
                    >
                      <Heart className={cn("h-5 w-5 sm:h-6 sm:w-6 transition-all", isWishlisted && "fill-current scale-110")} />
                      <span className="sm:hidden text-sm font-medium">{isWishlisted ? t('product.wishlisted') : t('product.addToWishlist')}</span>
                    </motion.div>
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col items-center text-center gap-1 sm:gap-2">
                <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-full bg-green-50 flex items-center justify-center">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-[#009744]" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 sm:gap-2">
                <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-full bg-green-50 flex items-center justify-center">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-[#009744]" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Quality Assured</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 sm:gap-2">
                <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-full bg-green-50 flex items-center justify-center">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-[#009744]" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Premium Grade</span>
              </div>
            </div>
          </div>
        </div>

        {/* End of Product Information */}
      </DialogContent>
    </Dialog>
  );
}
