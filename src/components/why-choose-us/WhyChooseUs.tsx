"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/src/components/ui/button";
import { useI18n } from "@/src/components/providers/i18n-provider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/src/components/ui/carousel";

export function WhyChooseUs() {
  const { t } = useI18n();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const features = [
    {
      number: "01",
      title: t('whychoose.feature1Title'),
      description: t('whychoose.feature1Desc')
    },
    {
      number: "02",
      title: t('whychoose.feature2Title'),
      description: t('whychoose.feature2Desc')
    },
    {
      number: "03",
      title: t('whychoose.feature3Title'),
      description: t('whychoose.feature3Desc')
    },
    {
      number: "04",
      title: t('whychoose.feature4Title'),
      description: t('whychoose.feature4Desc')
    },
    {
      number: "05",
      title: t('whychoose.feature5Title'),
      description: t('whychoose.feature5Desc')
    },
    {
      number: "06",
      title: t('whychoose.feature6Title'),
      description: t('whychoose.feature6Desc')
    }
  ];

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-play functionality for mobile
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      // Only auto-play on mobile (screens < 1024px)
      if (window.innerWidth < 1024) {
        api.scrollNext();
      }
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [api]);

  const renderFeature = (feature: typeof features[0], index: number, isMobile = false) => (
    <div
      key={index}
      className={`pt-2 xs:pt-3 sm:pt-6 md:pt-8 lg:pt-12 pb-2.5 xs:pb-3 sm:pb-6 md:pb-10 lg:pb-16 px-1.5 xs:px-2.5 sm:px-3 md:px-6 lg:px-8 group transition-colors duration-500 hover:bg-white
        ${!isMobile && index % 3 !== 0 ? 'lg:border-l lg:border-slate-100' : ''}
        ${!isMobile && index >= 3 ? 'border-t border-slate-100' : ''}
        ${!isMobile && index % 2 !== 0 ? 'sm:border-l sm:border-slate-100 lg:border-l-0' : ''}
        ${isMobile ? 'border-b border-slate-100 last:border-b-0' : ''}
      `}
    >
      <div className="relative">
        <span className="text-[5px] xs:text-[6px] sm:text-[7px] md:text-[8px] lg:text-[10px] font-bold tracking-widest text-primary/40 block mb-1 xs:mb-1.5 sm:mb-2 md:mb-3 lg:mb-6 transition-transform duration-500 group-hover:translate-x-1">
          {feature.number}
        </span>
        <h3 className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-heading font-medium text-slate-900 mb-1 xs:mb-1.5 sm:mb-2 md:mb-3 lg:mb-4 tracking-tight">
          {feature.title}
        </h3>
        <p className="text-slate-500 leading-relaxed font-body text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base max-w-[280px]">
          {feature.description}
        </p>

        {/* Subtle underline animation */}
        <div className="absolute -bottom-2 xs:-bottom-2.5 sm:-bottom-4 left-0 w-0 h-[1px] bg-primary/20 transition-all duration-700 group-hover:w-full" />
      </div>
    </div>
  );

  return (
    <section className="py-6 xs:py-8 sm:py-12 md:py-16 lg:py-20 xl:py-32 bg-[#FAFAFA] relative overflow-hidden">
      {/* Decorative background elements - very subtle */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white to-transparent pointer-events-none" />

      <div className="container mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center md:justify-start gap-1.5 xs:gap-2 md:gap-3 mb-1.5 xs:mb-2 sm:mb-3 md:mb-4 lg:mb-6 px-2 sm:px-0"
          >
            <span className="w-2 xs:w-3 sm:w-6 md:w-12 h-[1px] bg-primary" />
            <span className="text-primary font-medium tracking-[0.3em] uppercase text-[6px] xs:text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] flex-shrink-0">{t('whychoose.difference')}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-heading font-light text-slate-900 leading-[1.15] mb-1.5 xs:mb-2 sm:mb-4 md:mb-8 px-2 sm:px-0"
          >
            {t('whychoose.title')} <br />
            <span className="italic font-serif text-primary">{t('whychoose.subtitle')}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-slate-500 text-[8px] xs:text-[9px] sm:text-xs md:text-sm lg:text-base font-body leading-relaxed max-w-2xl border-l border-slate-200 pl-1.5 xs:pl-2 sm:pl-4 md:pl-8 ml-0 md:ml-1 px-2 sm:px-0"
          >
            {t('whychoose.description')}
          </motion.p>

        {/* Mobile Carousel View */}
        <div className="lg:hidden border-t border-slate-200">
          <Carousel
            setApi={setApi}
            opts={{
              loop: true,
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-0">
              {features.map((feature, index) => (
                <CarouselItem key={index} className="pl-0 basis-full min-w-full">
                  {renderFeature(feature, index, true)}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Mobile Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  current === index ? 'w-6 bg-primary' : 'w-1.5 bg-slate-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden lg:grid grid-cols-3 border-t border-slate-200">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
            >
              {renderFeature(feature, index, false)}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-6 sm:mt-8 md:mt-12 lg:mt-16 xl:mt-24 flex flex-col md:flex-row items-center justify-between border-t border-slate-200 pt-4 sm:pt-6 md:pt-8 lg:pt-12 gap-3 sm:gap-4 md:gap-0 px-2 sm:px-0"
        >
        </motion.div>
      </div>
    </section>
  );
}
