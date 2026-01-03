"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Category {
  id: string;
  name: string;
  image: string;
}

interface ExquisiteCollectionProps {
  title?: string;
  subtitle?: string;
  categories?: Category[];
}

const defaultCategories: Category[] = [
  {
    id: "1",
    name: "Premium Dry Fruits",
    image: "/images/hero/hero2.png",
  },
  {
    id: "2",
    name: "Nuts & Seeds",
    image: "/images/hero/hero3.png",
  },
  {
    id: "3",
    name: "Authentic Spices",
    image: "/images/hero/hero4.png",
  },
  {
    id: "4",
    name: "Kashmiri Saffron",
    image: "/images/hero/hero5.png",
  },
  {
    id: "5",
    name: "Spice Blends",
    image: "/images/hero/hero3.png",
  },
  {
    id: "6",
    name: "Exotic Chilies",
    image: "/images/hero/hero5.png",
  },
];

export function ExquisiteCollection({
  title = "Explore Our Exquisite Collection",
  subtitle = "Carefully curated premium dry fruits, nuts & spices",
  categories = defaultCategories,
}: ExquisiteCollectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollability);
    }
    window.addEventListener("resize", checkScrollability);
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", checkScrollability);
      }
      window.removeEventListener("resize", checkScrollability);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="w-full py-12 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
            <div className="text-center mb-10 md:mb-20 space-y-4 md:space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight font-heading">
                <span className="text-[#AB1F23]">Explore Our</span>{" "}
                <span className="text-[#009744]">Exquisite Collection</span>
              </h2>
              {subtitle && (
                <div className="flex items-center justify-center gap-3">
                  <div className="hidden sm:block h-[1px] w-8 bg-[#AB1F23]/20" />
                  <p className="text-base md:text-lg text-gray-500 max-w-2xl font-body italic tracking-wide">
                    {subtitle}
                  </p>
                  <div className="hidden sm:block h-[1px] w-8 bg-[#009744]/20" />
                </div>
              )}
            </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Left Arrow - Desktop Only */}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-200 shadow-lg transition-all duration-300",
              canScrollLeft
                ? "opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-xl hover:border-[#009744] hover:bg-[#009744]/5"
                : "opacity-0 cursor-not-allowed",
              "-translate-x-1/2"
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 group-hover:text-[#009744] transition-colors" />
          </button>

          {/* Right Arrow - Desktop Only */}
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-200 shadow-lg transition-all duration-300",
              canScrollRight
                ? "opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-xl hover:border-[#009744] hover:bg-[#009744]/5"
                : "opacity-0 cursor-not-allowed",
              "translate-x-1/2"
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-[#009744] transition-colors" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollability}
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {categories.map((category) => (
              <motion.div
                key={category.id}
                className="flex-shrink-0 w-[300px] md:w-[340px] snap-start"
                onMouseEnter={() => setHoveredCard(category.id)}
                onMouseLeave={() => setHoveredCard(null)}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div
                  className="relative h-[400px] md:h-[450px] rounded-3xl overflow-hidden cursor-pointer group/card bg-muted shadow-md hover:shadow-2xl transition-shadow duration-300"
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${category.name}`}
                >
                  {/* Image */}
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      animate={{
                        scale: hoveredCard === category.id ? 1.08 : 1,
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                    {/* Overlay with brand green gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-colors duration-300" />
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 flex items-end p-7">
                    <div className="w-full">
                      <motion.h3
                        className="text-white text-xl md:text-2xl font-bold tracking-tight font-heading"
                        animate={{
                          y: hoveredCard === category.id ? -4 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {category.name}
                      </motion.h3>

                      <AnimatePresence>
                        {hoveredCard === category.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4"
                          >
                            <span className="inline-flex items-center text-[#009744] text-sm font-semibold font-poppins group-hover/card:text-[#2E763B] transition-colors duration-300 bg-white/90 px-4 py-2 rounded-full">
                              Explore Collection
                              <ChevronRight className="ml-1 w-4 h-4" />
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
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
