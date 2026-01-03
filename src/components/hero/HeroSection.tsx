"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Heart, Truck, CheckCircle2, Star, Play, ArrowRight, Shield, Award, Headphones, Check, Leaf, Sparkles } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/src/components/ui/carousel";

/* ---------------------------------------------
   HERO SLIDES CONFIG
---------------------------------------------- */
const heroSlides = [
  {
    type: "video",
    src: "/images/hero/hero1.mp4",
    title: "Bringing Healthy Smiles",
    subtitle: "to Every Home",
    description:
      "Experience the joy of premium organic products delivered fresh to your door. From handpicked almonds to pure honey - bringing health and happiness to families across the UAE.",
    align: "center",
    overlay: "dark",
    showStats: true,
    showFeatures: true,
    showBanner: true,
  },
  {
    type: "image",
    src: "/images/hero/hero2.png",
    title: "Fresh & Natural",
    subtitle: "Dry Fruits",
    description:
      "Handpicked premium dry fruits sourced directly for maximum freshness.",
    align: "right",
    overlay: "light",
    accent: "#009744",
  },
  {
    type: "image",
    src: "/images/hero/hero3.png",
    title: "Premium Quality",
    subtitle: "Nuts & Spices",
    description:
      "A curated selection of nuts and spices chosen for purity, aroma, and taste.",
    align: "right",
    overlay: "light",
    accent: "#AB1F23",
  },
  {
    type: "image",
    src: "/images/hero/hero4.png",
    title: "Authentic Saffron",
    subtitle: "From Source",
    description:
      "Experience the richness of handpicked saffron and whole spices.",
    align: "right",
    overlay: "light",
    accent: "#009744",
  },
  {
    type: "image",
    src: "/images/hero/hero5.png",
    title: "Bold Flavors",
    subtitle: "Spice Collection",
    description:
      "From mild warmth to fiery heat — spices that elevate every dish.",
    align: "right-bottom",
    overlay: "dark",
    accent: "#AB1F23",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, x: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
  },
};

export function HeroSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (!api) return;

    const id = setInterval(() => {
      const currentIndex = api.selectedScrollSnap();
      if (currentIndex !== 0) {
        api.scrollNext();
      }
    }, 8000);

    return () => clearInterval(id);
  }, [api]);

  const slide = heroSlides[current];

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* ---------------- BACKGROUND CAROUSEL ---------------- */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <Carousel
          setApi={setApi}
          opts={{ loop: true }}
          className="h-full w-full"
        >
          <CarouselContent className="h-full -ml-0">
            {heroSlides.map((s, i) => (
              <CarouselItem key={i} className="relative h-full w-full pl-0 basis-full min-w-full">
                <div className="relative h-full w-full overflow-hidden" style={{ minHeight: "100vh" }}>
                  {s.type === "video" ? (
                    <video
                      autoPlay
                      muted
                      playsInline
                      loop
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        zIndex: 0
                      }}
                    >
                      <source src={s.src} type="video/mp4" />
                    </video>
                  ) : (
                    <>
                      <motion.div
                        initial={{ scale: 1.2 }}
                        animate={{ scale: current === i ? 1 : 1.2 }}
                        transition={{ duration: 10, ease: "linear" }}
                        className="absolute inset-0"
                      >
                        <img
                          src={s.src}
                          alt={s.title}
                          className="h-full w-full object-cover object-center blur-sm"
                          loading={i === 0 ? "eager" : "lazy"}
                        />
                      </motion.div>
                      <div
                        className="absolute inset-0 z-0"
                        style={{
                          background: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)",
                        }}
                      />
                    </>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* ---------------- OVERLAY ---------------- */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-1000 ${
          slide.overlay === "dark"
            ? "bg-gradient-to-r from-black/80 via-black/50 to-black/20"
            : "bg-gradient-to-r from-black/60 via-black/30 to-transparent"
        }`}
      />

      {/* ---------------- CONTENT ---------------- */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatePresence mode="wait">
            {slide.showBanner && current === 0 ? (
                <motion.div 
                  key="slide-0"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="w-full max-w-6xl mx-auto px-4"
                >
                  <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 mb-6">
                    <span className="bg-[#AB1F23]/20 backdrop-blur-md border border-[#AB1F23]/30 px-4 py-1.5 rounded-full flex items-center gap-2">
                      <Heart className="h-4 w-4 text-[#AB1F23]" fill="#AB1F23" />
                      <span className="text-white text-xs sm:text-sm font-semibold tracking-widest uppercase">Real Customers, Real Joy</span>
                    </span>
                  </motion.div>

                    <div className="text-center mb-6 sm:mb-10">
                      <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] font-heading mb-2 drop-shadow-2xl">
                        {slide.title}
                      </motion.h1>
                      <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[#FFD700] leading-[1.1] font-heading mb-4 sm:mb-8 drop-shadow-2xl">
                        {slide.subtitle}
                      </motion.h1>
                      <motion.p variants={itemVariants} className="text-base sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-body font-light leading-relaxed mb-6 sm:mb-10">
                        {slide.description}
                      </motion.p>
                    </div>

                    <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
                      {[
                        { icon: "🌿", label: "Farm Fresh", desc: "Direct from source", color: "#009744" },
                        { icon: <Truck className="h-5 w-5 sm:h-6 sm:w-6" />, label: "Express", desc: "Free on ₹99+", color: "#FFD700" },
                        { icon: <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />, label: "Organic", desc: "Premium Quality", color: "#009744" },
                        { icon: <Star className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" />, label: "Top Rated", desc: "Trusted Brand", color: "#AB1F23" }
                      ].map((feat, idx) => (
                        <div key={idx} className="group bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-500 cursor-default">
                          <div className="flex justify-center mb-2 sm:mb-3">
                            <div 
                              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                              style={{ backgroundColor: `${feat.color}20`, color: feat.color }}
                            >
                              <span className="text-xl sm:text-2xl">{feat.icon}</span>
                            </div>
                          </div>
                          <div className="text-xs sm:text-base text-white font-bold font-poppins mb-0.5">{feat.label}</div>
                          <div className="text-white/60 text-[10px] sm:text-xs font-body tracking-tight">{feat.desc}</div>
                        </div>
                      ))}
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto group relative bg-[#009744] hover:bg-[#00803a] text-white px-8 sm:px-10 py-6 sm:py-8 text-base sm:text-lg font-bold shadow-[0_0_20px_rgba(0,151,68,0.4)] rounded-full transition-all duration-500 overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          EXPLORE PRODUCTS
                          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto border-2 border-white/30 text-white bg-white/5 hover:bg-white/15 hover:border-white/60 px-8 sm:px-10 py-6 sm:py-8 text-base sm:text-lg font-semibold rounded-full transition-all duration-500 backdrop-blur-md flex items-center justify-center gap-3"
                      >
                        OUR STORY
                        <Play className="h-5 w-5 fill-white" />
                      </Button>
                    </motion.div>

                </motion.div>
            ) : (
              <motion.div 
                key={`slide-${current}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                  <div className="text-left space-y-8">
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-[#009744]/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg border border-[#009744]/20">
                      <Sparkles className="h-4 w-4 text-[#FFD700]" />
                      <span className="text-xs sm:text-sm font-bold font-poppins tracking-widest uppercase">Al Fajer Signature</span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-6xl sm:text-7xl md:text-8xl font-bold text-white leading-[1] font-heading tracking-tight">
                      {slide.title}
                      <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009744] to-[#00b350] drop-shadow-sm">{slide.subtitle}</span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-xl sm:text-2xl text-white/80 max-w-lg font-body font-light leading-relaxed">
                      {slide.description}
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-wrap gap-8">
                      {[
                        { icon: <Check className="h-5 w-5" />, label: "100% Organic" },
                        { icon: <Leaf className="h-5 w-5" />, label: "No Additives" },
                        { icon: <Award className="h-5 w-5" />, label: "Premium Selection" }
                      ].map((f, i) => (
                        <div key={i} className="flex items-center gap-3 group">
                          <div className="h-8 w-8 rounded-full bg-[#009744]/20 flex items-center justify-center text-[#009744] transition-transform group-hover:scale-110">
                            {f.icon}
                          </div>
                          <span className="text-white font-medium font-body text-lg">{f.label}</span>
                        </div>
                      ))}
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 pt-6">
                      <Button
                        size="lg"
                        className="group relative bg-[#009744] hover:bg-[#00803a] text-white px-10 py-8 text-xl font-bold shadow-2xl rounded-full transition-all duration-500"
                      >
                        <span className="flex items-center gap-3">
                          SHOP NOW
                          <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-2 border-white/20 text-white bg-white/5 hover:bg-white/10 px-10 py-8 text-xl font-semibold rounded-full transition-all duration-500 backdrop-blur-md"
                      >
                        VIEW ALL
                      </Button>
                    </motion.div>
                  </div>

                  <motion.div 
                    variants={cardVariants}
                    className="relative group hidden lg:block"
                  >
                    <div className="absolute -inset-4 bg-gradient-to-tr from-[#009744]/20 to-[#AB1F23]/20 rounded-[40px] blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                    
                    <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden p-4">
                      {/* Product Image Container */}
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-900 shadow-inner">
                        <Image
                          src={slide.src}
                          alt={slide.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="absolute top-4 right-4 bg-[#AB1F23] text-white px-4 py-2 rounded-xl shadow-lg transform rotate-2">
                          <span className="text-xs font-black font-poppins tracking-tighter">OFF 20%</span>
                        </div>
                      </div>

                      {/* Info Panel */}
                      <div className="p-6 space-y-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-[#FFD700] fill-[#FFD700]" />
                            ))}
                            <span className="ml-2 text-xs text-white/60 font-medium">4.9/5.0</span>
                          </div>
                          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">In Stock</span>
                        </div>

                        <div className="flex items-end justify-between border-t border-white/10 pt-5">
                          <div>
                            <p className="text-xs text-white/50 font-medium mb-1 uppercase tracking-wide">Starting from</p>
                            <p className="text-4xl font-black text-[#FFD700] font-heading tracking-tight">
                              ₹89.99
                            </p>
                          </div>
                          <button className="h-14 w-14 rounded-2xl bg-[#009744] hover:bg-[#00803a] text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 active:scale-95">
                            <ArrowRight className="h-6 w-6" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Floating Decorative Elements */}
                    <div className="absolute -top-6 -left-6 bg-[#009744] text-white p-4 rounded-2xl shadow-2xl transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                      <Leaf className="h-6 w-6" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ---------------- NAVIGATION ---------------- */}
      <div className="absolute bottom-10 left-1/2 z-30 flex -translate-x-1/2 items-center gap-6">
        <div className="flex gap-3">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`group relative h-1 rounded-full transition-all duration-500 overflow-hidden ${
                i === current ? "w-12 bg-white/20" : "w-4 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            >
              {i === current && (
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 8, ease: "linear" }}
                  className="absolute inset-0 bg-[#009744]"
                />
              )}
            </button>
          ))}
        </div>
        
        <div className="hidden sm:flex items-center gap-2 text-white/30 text-[10px] font-black tracking-[0.2em] uppercase">
          <span className="text-white/80">{String(current + 1).padStart(2, '0')}</span>
          <div className="h-px w-8 bg-white/20" />
          <span>{String(heroSlides.length).padStart(2, '0')}</span>
        </div>
      </div>

      {/* ---------------- SIDEBAR DECOR (Professional Touch) ---------------- */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col gap-12 items-center">
        <div className="h-20 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <span className="rotate-90 text-[10px] text-white/20 font-bold tracking-[0.5em] uppercase whitespace-nowrap">Scroll for Wellness</span>
        <div className="h-20 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      </div>
    </section>
  );
}
