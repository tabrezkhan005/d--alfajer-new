"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
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
  Truck,
  Shield,
  Award,
  Check,
  ChevronDown,
  User,
  ThumbsUp,
  AlertTriangle,
  Leaf,
  Package,
  Building2,
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

const nutritionData = {
  servingSize: "30g (about 23 almonds)",
  calories: 164,
  nutrients: [
    { name: "Total Fat", value: "14g", daily: "18%" },
    { name: "Saturated Fat", value: "1.1g", daily: "5%" },
    { name: "Cholesterol", value: "0mg", daily: "0%" },
    { name: "Sodium", value: "0mg", daily: "0%" },
    { name: "Total Carbohydrates", value: "6g", daily: "2%" },
    { name: "Dietary Fiber", value: "3.5g", daily: "13%" },
    { name: "Sugars", value: "1g", daily: "-" },
    { name: "Protein", value: "6g", daily: "12%" },
    { name: "Vitamin E", value: "7.3mg", daily: "49%" },
    { name: "Magnesium", value: "76mg", daily: "18%" },
  ],
};

const allergenInfo = {
  contains: ["Tree Nuts (Almonds)"],
  mayContain: ["Other Tree Nuts", "Peanuts"],
  freeFrom: ["Gluten", "Dairy", "Soy", "Eggs"],
};

const wholesaleInfo = {
  minOrder: "10 kg",
  bulkDiscount: "15-25%",
  leadTime: "3-5 business days",
  contact: "wholesale@alfajer.ae",
};

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductModal({ product, open, onOpenChange }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [reviewFilter, setReviewFilter] = useState<"all" | number>("all");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: "", comment: "" });
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

  const filteredReviews = reviewFilter === "all"
    ? mockReviews
    : mockReviews.filter(r => r.rating === reviewFilter);

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: mockReviews.filter(r => r.rating === star).length,
    percentage: (mockReviews.filter(r => r.rating === star).length / mockReviews.length) * 100,
  }));

  const handleSubmitReview = () => {
    setShowReviewForm(false);
    setNewReview({ rating: 5, title: "", comment: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 bg-white rounded-lg sm:rounded-2xl lg:rounded-3xl border-0 shadow-2xl left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[calc(100vw-2rem)] sm:w-full sm:max-w-5xl mx-0">
        <VisuallyHidden>
          <DialogTitle>{product.name}</DialogTitle>
        </VisuallyHidden>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left: Product Image Gallery */}
            <div className="relative bg-[#FBFBFC] p-3 sm:p-4 lg:p-6 flex flex-col min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
              {product.badge && (
                <Badge
                  className={cn(
                    "absolute top-3 sm:top-4 lg:top-6 left-3 sm:left-4 lg:left-6 z-10 px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-full text-[10px] sm:text-xs font-bold text-white shadow-lg uppercase tracking-wider font-poppins",
                    product.badge === "SALE" && "bg-[#AB1F23]",
                    product.badge === "HOT" && "bg-orange-500",
                    product.badge === "NEW" && "bg-[#009744]"
                  )}
                >
                  {product.badge}
                </Badge>
              )}
              {product.discount && !product.badge && (
                <Badge className="absolute top-3 sm:top-4 lg:top-6 left-3 sm:left-4 lg:left-6 z-10 bg-[#AB1F23] text-white px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-full text-[10px] sm:text-xs font-bold shadow-lg font-poppins tracking-wider">
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
                    ) : (
                      <img
                        src={selectedMedia}
                        alt={`${product.name} - Image ${selectedMediaIndex + 1}`}
                        className="w-full h-full max-h-[400px] sm:max-h-[500px] object-contain drop-shadow-2xl rounded-lg"
                      />
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
                            <span className="absolute bottom-1 left-1 text-[8px] sm:text-[10px] text-gray-600 font-medium bg-white/80 px-1 rounded">VIDEO</span>
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
                  {product.name}
                </h2>
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 text-xs sm:text-sm font-medium">
                  <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-poppins">Origin: {product.origin}</span>
                  <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-poppins">{product.packageSize}</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#009744] font-heading tracking-tight">
                  AED {product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg sm:text-xl text-gray-400 line-through font-body decoration-gray-300">
                    AED {product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-500 text-sm sm:text-base lg:text-lg leading-relaxed font-body">
                {product.description || `Premium quality ${product.name.toLowerCase()} sourced directly from ${product.origin}. Perfectly processed and packed to preserve natural flavor and nutrients.`}
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
                  className="h-11 sm:h-12 w-11 sm:w-12 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors border-r border-gray-300"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" />
                </button>
                <span className="w-14 sm:w-16 text-center font-bold text-lg sm:text-xl font-poppins text-gray-900 bg-gray-50 py-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-11 sm:h-12 w-11 sm:w-12 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors border-l border-gray-300"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" />
                </button>
              </div>
            </div>

              {/* Action Buttons */}
              <div className="flex gap-3 sm:gap-4 pt-4 flex-col sm:flex-row">
                <Button
                  size="lg"
                  className="flex-1 bg-[#009744] hover:bg-[#00803a] text-white font-bold h-14 sm:h-14 rounded-full shadow-[0_4px_14px_0_rgba(0,151,68,0.39)] hover:shadow-[0_6px_20px_rgba(0,151,68,0.23)] transition-all duration-300 font-poppins text-base sm:text-base active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-2 w-full sm:w-auto"
                >
                  <ShoppingCart className="h-5 w-5 sm:h-5 sm:w-5" />
                  <span>Add to Cart</span>
                </Button>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={cn(
                      "h-12 sm:h-14 w-12 sm:w-14 rounded-full border-2 transition-all bg-white",
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
                      >
                        <Heart className={cn("h-5 w-5 sm:h-6 sm:w-6 transition-all", isWishlisted && "fill-current scale-110")} />
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

        {/* Tabs Section */}
        <div className="border-t border-gray-100 p-4 sm:p-6 lg:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-gray-100 p-1.5 sm:p-2 rounded-full h-auto grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-2 sm:justify-center">
              <TabsTrigger
                value="details"
                className="rounded-full px-3 sm:px-6 py-2.5 sm:py-3 font-semibold font-poppins text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#009744] data-[state=active]:shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 flex-shrink-0"
              >
                <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Details</span>
              </TabsTrigger>
              <TabsTrigger
                value="nutrition"
                className="rounded-full px-3 sm:px-6 py-2.5 sm:py-3 font-semibold font-poppins text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#009744] data-[state=active]:shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 flex-shrink-0"
              >
                <Leaf className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Nutrition</span>
              </TabsTrigger>
              <TabsTrigger
                value="allergens"
                className="rounded-full px-3 sm:px-6 py-2.5 sm:py-3 font-semibold font-poppins text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#009744] data-[state=active]:shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 flex-shrink-0"
              >
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Allergens</span>
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-full px-3 sm:px-6 py-2.5 sm:py-3 font-semibold font-poppins text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#009744] data-[state=active]:shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 flex-shrink-0"
              >
                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Reviews ({mockReviews.length})</span>
                <span className="sm:hidden">Reviews</span>
              </TabsTrigger>
              <TabsTrigger
                value="wholesale"
                className="rounded-full px-3 sm:px-6 py-2.5 sm:py-3 font-semibold font-poppins text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#009744] data-[state=active]:shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 flex-shrink-0 col-span-2 sm:col-span-1 mx-auto sm:mx-0"
              >
                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Wholesale</span>
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="mt-4 sm:mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 font-poppins text-base sm:text-lg">Product Specifications</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Product Name", value: product.name },
                      { label: "Package Size", value: product.packageSize },
                      { label: "Origin", value: product.origin },
                      { label: "Shelf Life", value: "12 months from packaging" },
                      { label: "Storage", value: "Cool, dry place away from sunlight" },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-xs sm:text-sm text-gray-500 font-body">{item.label}</span>
                        <span className="font-semibold text-xs sm:text-sm text-gray-900 font-body">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 font-poppins text-base sm:text-lg">Why Choose This Product?</h4>
                  <ul className="space-y-3">
                    {[
                      "Handpicked from premium farms",
                      "No artificial preservatives or additives",
                      "Vacuum-sealed for maximum freshness",
                      "Rich in essential nutrients and antioxidants",
                      "Perfect for health-conscious families",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-[#009744]" />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 font-body">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Nutrition Tab */}
            <TabsContent value="nutrition" className="mt-4 sm:mt-6">
              <div className="max-w-xl">
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h4 className="font-bold text-gray-900 font-poppins text-base sm:text-lg mb-1">Nutrition Facts</h4>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4 font-body">Serving Size: {nutritionData.servingSize}</p>
                  <div className="border-t-8 border-gray-900 pt-2">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="font-bold text-sm sm:text-base text-gray-900">Calories</span>
                      <span className="font-bold text-sm sm:text-base text-gray-900">{nutritionData.calories}</span>
                    </div>
                    <p className="text-xs text-gray-500 text-right py-1">% Daily Value*</p>
                    {nutritionData.nutrients.map((nutrient) => (
                      <div key={nutrient.name} className="flex justify-between py-2 border-b border-gray-100 text-xs sm:text-sm">
                        <span className="text-gray-700 font-body">{nutrient.name} <span className="font-semibold">{nutrient.value}</span></span>
                        <span className="font-semibold text-gray-900">{nutrient.daily}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4 font-body">
                    *Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Allergens Tab */}
            <TabsContent value="allergens" className="mt-4 sm:mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-red-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                    <h4 className="font-bold text-red-700 font-poppins text-sm sm:text-base">Contains</h4>
                  </div>
                  <ul className="space-y-2">
                    {allergenInfo.contains.map((item) => (
                      <li key={item} className="text-red-600 font-semibold font-body text-xs sm:text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                    <h4 className="font-bold text-amber-700 font-poppins text-sm sm:text-base">May Contain</h4>
                  </div>
                  <ul className="space-y-2">
                    {allergenInfo.mayContain.map((item) => (
                      <li key={item} className="text-amber-600 font-medium font-body text-xs sm:text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    <h4 className="font-bold text-green-700 font-poppins text-sm sm:text-base">Free From</h4>
                  </div>
                  <ul className="space-y-2">
                    {allergenInfo.freeFrom.map((item) => (
                      <li key={item} className="text-green-600 font-medium font-body text-xs sm:text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-4 sm:mt-6">
              <div className="space-y-6 sm:space-y-8">
                {/* Rating Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                    <div className="text-center">
                      <div className="text-4xl sm:text-5xl font-bold text-gray-900 font-heading">{product.rating}</div>
                      <div className="flex items-center gap-1 mt-2 justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4 sm:h-5 sm:w-5",
                              i < Math.floor(product.rating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-200 fill-gray-200"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 font-body">{mockReviews.length} reviews</p>
                    </div>
                    <div className="flex-1 space-y-2 w-full sm:w-auto">
                      {ratingCounts.map(({ star, count, percentage }) => (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs sm:text-sm text-gray-600 w-8 font-body">{star} ★</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs sm:text-sm text-gray-500 w-8 font-body">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filter & Write Review */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                      <span className="text-xs sm:text-sm font-semibold text-gray-700 font-poppins">Filter:</span>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={reviewFilter === "all" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setReviewFilter("all")}
                          className={cn(
                            "rounded-full font-medium text-xs sm:text-sm",
                            reviewFilter === "all" && "bg-[#009744] hover:bg-[#00803a]"
                          )}
                        >
                          All Reviews
                        </Button>
                        {[5, 4, 3, 2, 1].map((star) => (
                          <Button
                            key={star}
                            variant={reviewFilter === star ? "default" : "outline"}
                            size="sm"
                            onClick={() => setReviewFilter(star)}
                            className={cn(
                              "rounded-full font-medium text-xs sm:text-sm",
                              reviewFilter === star && "bg-[#009744] hover:bg-[#00803a]"
                            )}
                          >
                            {star} ★
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="bg-[#AB1F23] hover:bg-[#8B1A1D] text-white font-semibold rounded-full font-poppins w-full sm:w-auto text-sm sm:text-base"
                    >
                      Write a Review
                    </Button>
                  </div>
                </div>

                {/* Write Review Form */}
                {showReviewForm && (
                  <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4">
                    <h4 className="font-bold text-gray-900 font-poppins text-base sm:text-lg">Write Your Review</h4>
                    <div className="space-y-2">
                      <Label className="font-medium font-poppins text-sm">Your Rating</Label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className="p-1"
                          >
                            <Star
                              className={cn(
                                "h-6 w-6 sm:h-8 sm:w-8 transition-colors",
                                star <= newReview.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-300"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium font-poppins text-sm">Review Title</Label>
                      <Input
                        placeholder="Summarize your experience"
                        value={newReview.title}
                        onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                        className="rounded-lg sm:rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium font-poppins text-sm">Your Review</Label>
                      <Textarea
                        placeholder="Share your thoughts about this product..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        className="rounded-lg sm:rounded-xl min-h-[100px] sm:min-h-[120px] text-sm"
                      />
                    </div>
                    <div className="flex gap-2 sm:gap-3 flex-col sm:flex-row">
                      <Button
                        onClick={handleSubmitReview}
                        className="bg-[#009744] hover:bg-[#00803a] text-white font-semibold rounded-full font-poppins text-sm sm:text-base"
                      >
                        Submit Review
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowReviewForm(false)}
                        className="rounded-full font-poppins text-sm sm:text-base"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {filteredReviews.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 font-body text-sm">No reviews found for this filter.</p>
                    </div>
                  ) : (
                    filteredReviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6">
                        <div className="flex items-start justify-between gap-3 sm:gap-4 flex-col sm:flex-row">
                          <div className="flex items-start gap-3 sm:gap-4 flex-1">
                            <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900 font-poppins text-sm sm:text-base">{review.user}</span>
                                {review.verified && (
                                  <Badge className="bg-green-100 text-green-700 text-xs font-medium">
                                    <Check className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "h-3 w-3 sm:h-4 sm:w-4",
                                        i < review.rating
                                          ? "text-amber-400 fill-amber-400"
                                          : "text-gray-200 fill-gray-200"
                                      )}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-xs sm:text-sm text-gray-500 font-body">
                                  {new Date(review.date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-4 sm:ml-16">
                          <h5 className="font-semibold text-gray-900 font-poppins text-sm sm:text-base">{review.title}</h5>
                          <p className="text-gray-600 mt-2 font-body leading-relaxed text-sm">{review.comment}</p>
                          <button className="flex items-center gap-2 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 hover:text-[#009744] transition-colors font-medium">
                            <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                            Helpful ({review.helpful})
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Wholesale Tab */}
            <TabsContent value="wholesale" className="mt-4 sm:mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-900 font-poppins text-base sm:text-lg mb-4">Bulk Order Information</h4>
                    <div className="space-y-4">
                      {[
                        { label: "Minimum Order", value: wholesaleInfo.minOrder, icon: Package },
                        { label: "Bulk Discount", value: wholesaleInfo.bulkDiscount, icon: Award },
                        { label: "Lead Time", value: wholesaleInfo.leadTime, icon: Truck },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#009744]/10 flex items-center justify-center flex-shrink-0">
                            <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#009744]" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500 font-body">{item.label}</p>
                            <p className="font-bold text-sm sm:text-base text-gray-900 font-poppins">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#009744] to-[#00803a] rounded-lg sm:rounded-2xl p-6 sm:p-8 text-white">
                  <Building2 className="h-10 w-10 sm:h-12 sm:w-12 mb-4 opacity-80" />
                  <h4 className="font-bold text-lg sm:text-xl font-poppins mb-2">Interested in Wholesale?</h4>
                  <p className="text-white/80 font-body mb-6 text-sm sm:text-base">
                    Get special pricing for bulk orders. Perfect for restaurants, hotels, retailers, and businesses.
                  </p>
                  <div className="space-y-4">
                    <Button
                      className="w-full bg-white text-[#009744] hover:bg-gray-100 font-bold rounded-full font-poppins text-sm sm:text-base"
                    >
                      Request Quote
                    </Button>
                    <p className="text-xs sm:text-sm text-white/70 text-center font-body">
                      Or email us at <a href={`mailto:${wholesaleInfo.contact}`} className="underline font-semibold">{wholesaleInfo.contact}</a>
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
