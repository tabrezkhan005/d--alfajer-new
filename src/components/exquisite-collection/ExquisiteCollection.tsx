"use client";

import * as React from "react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useI18n } from "@/src/components/providers/i18n-provider";

interface Category {
  id: string;
  name: string;
  image: string;
  comingSoon?: boolean;
}

interface ExquisiteCollectionProps {
  title?: string;
  subtitle?: string;
  categories?: Category[];
}

// Default images to use when categories are fetched from DB
const categoryImages: { [key: string]: string } = {
  "Dry Fruits": "/images/hero/hero2.png",
  "Nuts": "/images/hero/hero3.png",
  "Seeds": "/images/hero/hero3.png",
  "Spices": "/images/hero/hero4.png",
  "Gift Packs": "/images/hero/hero2.png",
  "Honey & Spreads": "/images/hero/hero5.png",
  "Mixes": "/images/hero/hero3.png",
  "Organic": "/images/hero/hero4.png",
  "Tea & Beverages": "/images/hero/hero5.png",
};

const defaultImage = "/images/hero/hero2.png";

import { getCategories } from "@/src/lib/supabase/products";

export function ExquisiteCollection({
  title = "Explore Our Exquisite Collection",
  subtitle = "Carefully curated premium dry fruits, nuts & spices",
  categories: propCategories,
}: ExquisiteCollectionProps) {
  const { t } = useI18n();
  const categories: Category[] = [
    {
      id: "shilajit",
      name: "Shilajit",
      image: "/images/hero/shilajit.png",
    },
    {
      id: "saffron",
      name: "Saffron",
      image: "/images/hero/hero4.png",
    },
    {
      id: "dry-fruits",
      name: "Premium Dry Fruits",
      // Using existing mapping or explicit path
      image: "/images/hero/hero2.png",
    },
    {
      id: "spices",
      name: "Authentic Spices",
      // Using existing mapping or explicit path
      image: "/images/hero/hero5.png",
    },
    {
      id: "combo",
      name: "Combo",
      image: "/images/hero/hero2.png",
      comingSoon: true,
    },
  ];

  /*
     Removed DB fetching logic to enforce strictly these 4 items as requested.
     If dynamic fetching is needed again, restore the useEffect and getCategories call.
  */

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Category name to translation key mapping (for dynamic DB categories)
  const categoryKeyMap: { [key: string]: string } = {
    "Dry Fruits": "productCategory.premiumDryFruits",
    "Nuts": "productCategory.nutsSeeds",
    "Seeds": "productCategory.nutsSeeds",
    "Spices": "productCategory.authenticSpices",
    "Gift Packs": "productCategory.giftPacks",
    "Honey & Spreads": "productCategory.honeySpreads",
    "Mixes": "productCategory.mixes",
    "Organic": "productCategory.organic",
    "Tea & Beverages": "productCategory.teaBeverages",
  };

  // Helper function to get translated category name with fallback
  // We can just return the name directly since these are hardcoded, or keep using translation if keys exist
  const getCategoryName = (categoryName: string): string => {
     // Check for specific keys for our new items
     if (categoryName === "Shilajit") return t('productCategory.shilajit') === 'productCategory.shilajit' ? "Pure Shilajit" : t('productCategory.shilajit');
     if (categoryName === "Saffron") return t('productCategory.saffron') === 'productCategory.saffron' ? "Premium Saffron" : t('productCategory.saffron');
     if (categoryName === "Combo") return "Combo";

     const translationKey = categoryKeyMap[categoryName] || `productCategory.${categoryName.replace(/\s+/g, '')}`;
     const translated = t(translationKey);
     return translated === translationKey ? categoryName : translated;
  };

  return (
    <section className="w-full py-8 xs:py-10 sm:py-12 md:py-16 lg:py-20 xl:py-28 bg-white overflow-x-hidden">
      <div className="container mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 xs:mb-8 sm:mb-12 md:mb-14 lg:mb-20 space-y-2.5 xs:space-y-3 sm:space-y-6">
          <h2 className="text-lg xs:text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight font-heading">
            <span className="text-[#AB1F23]">{t('collection.exploreOur')}</span>{" "}
            <span className="text-[#009744]">{t('collection.exquisiteTitle')}</span>
          </h2>
          {subtitle && (
            <div className="flex flex-col xs:flex-col sm:flex-row items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 px-2 xs:px-3 sm:px-0">
              <div className="hidden sm:block h-px w-4 xs:w-5 sm:w-8 bg-[#AB1F23]/20" />
              <p className="text-sm xs:text-base sm:text-sm md:text-base lg:text-lg text-gray-500 max-w-2xl font-body italic tracking-wide">
                {t('collection.subtitle')}
              </p>
              <div className="hidden sm:block h-px w-4 xs:w-5 sm:w-8 bg-[#009744]/20" />
            </div>
          )}
        </div>

        {/* Carousel Container */}
        <div className="relative group flex justify-center">
          {/* Collection Cards - One line on all screens */}
          <div className="flex gap-4 sm:gap-6 md:gap-8 justify-center items-center flex-wrap sm:flex-nowrap px-2 xs:px-3 sm:px-0">
            {categories.map((category) => {
              // Map category names to database category names
              const categoryNameMap: { [key: string]: string } = {
                "Shilajit": "Shilajit",
                "Saffron": "Saffron",
                "Premium Dry Fruits": "Dry Fruits",
                "Authentic Spices": "Spices",
                "Combo": "Combo",
              };
              const dbCategoryName = categoryNameMap[category.name] || category.name;
              
              // For coming soon items, don't make them clickable
              const cardContent = (
                <motion.div
                  className="shrink-0 w-[85vw] xs:w-[calc(50vw-24px)] sm:w-[280px] md:w-[300px] lg:w-[320px] xl:w-[340px]"
                  onMouseEnter={() => setHoveredCard(category.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  whileHover={category.comingSoon ? {} : { y: -8 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div
                    className={`relative h-[280px] xs:h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] rounded-2xl overflow-hidden ${category.comingSoon ? '' : 'cursor-pointer group/card'} bg-muted shadow-md hover:shadow-2xl transition-shadow duration-300 ${category.comingSoon ? 'opacity-75' : ''}`}
                    role={category.comingSoon ? undefined : "button"}
                    tabIndex={category.comingSoon ? undefined : 0}
                    aria-label={category.comingSoon ? `${category.name} - Coming Soon` : `View ${category.name}`}
                  >
                    {/* Image */}
                    <div className="absolute inset-0 overflow-hidden">
                      <motion.img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        animate={{
                          scale: hoveredCard === category.id && !category.comingSoon ? 1.08 : 1,
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        onError={(e) => {
                          // Fallback to default image if category image fails to load
                          const target = e.target as HTMLImageElement;
                          if (target.src !== defaultImage) {
                            target.src = defaultImage;
                          }
                        }}
                      />
                      {/* Overlay with brand green gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-colors duration-300" />
                    </div>

                    {/* Coming Soon Badge */}
                    {category.comingSoon && (
                      <div className="absolute top-4 right-4 z-10">
                        <span className="inline-flex items-center bg-[#009744] text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                          Coming Soon
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="absolute inset-0 flex items-end p-4 sm:p-5 md:p-7">
                      <div className="w-full">
                        <motion.h3
                          className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight font-heading"
                          animate={{
                            y: hoveredCard === category.id && !category.comingSoon ? -4 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {getCategoryName(category.name)}
                        </motion.h3>

                        <AnimatePresence>
                          {hoveredCard === category.id && !category.comingSoon && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.2 }}
                              className="mt-3 md:mt-4"
                            >
                              <span className="inline-flex items-center text-[#009744] text-xs md:text-sm font-semibold font-poppins group-hover/card:text-[#2E763B] transition-colors duration-300 bg-white/90 px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                                {t('collection.exploreCollection')}
                                <ChevronRight className="ml-1 w-3 md:w-4 h-3 md:h-4" />
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );

              // If coming soon, don't wrap in Link
              if (category.comingSoon) {
                return <React.Fragment key={category.id}>{cardContent}</React.Fragment>;
              }

              // Otherwise, wrap in Link to products page with category filter
              return (
                <Link key={category.id} href={`/products?category=${encodeURIComponent(dbCategoryName)}`}>
                  {cardContent}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
