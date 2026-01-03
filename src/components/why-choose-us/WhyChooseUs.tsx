"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/src/components/ui/button";

const features = [
  {
    number: "01",
    title: "Premium Quality",
    description: "We source only the finest hand-picked dates and premium nuts from the most fertile regions, ensuring unparalleled quality."
  },
  {
    number: "02",
    title: "100% Natural",
    description: "Our products are free from artificial preservatives or additives. Enjoy the pure, authentic taste of nature's bounty."
  },
  {
    number: "03",
    title: "Nutrient Rich",
    description: "Packed with essential vitamins, minerals, and natural energy, our dates are the perfect addition to a healthy lifestyle."
  },
  {
    number: "04",
    title: "Exquisite Packaging",
    description: "Our elegant packaging makes Al Fajr products the ideal choice for corporate gifts, weddings, and special occasions."
  },
  {
    number: "05",
    title: "Heritage & Tradition",
    description: "We honor centuries-old traditions while embracing modern standards, bringing you the authentic taste of the Orient."
  },
  {
    number: "06",
    title: "Fast & Fresh Delivery",
    description: "We ensure our products reach you in their freshest state through our optimized supply chain and fresh storage."
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-32 bg-[#FAFAFA] relative overflow-hidden">
      {/* Decorative background elements - very subtle */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mb-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-6"
          >
            <span className="w-12 h-[1px] bg-primary" />
            <span className="text-primary font-medium tracking-[0.3em] uppercase text-[10px]">The Al Fajr Difference</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-heading font-light text-slate-900 leading-[1.1] mb-8"
          >
            Crafting Excellence <br />
            <span className="italic font-serif text-primary">In Every Detail.</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-slate-500 text-xl font-body leading-relaxed max-w-2xl border-l border-slate-200 pl-8 ml-1"
          >
            We are committed to providing the most exquisite dates and nuts, 
            combining traditional heritage with modern excellence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-slate-200">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className={`pt-12 pb-16 px-0 md:px-8 group transition-colors duration-500 hover:bg-white
                ${index % 3 !== 0 ? 'lg:border-l lg:border-slate-100' : ''}
                ${index >= 3 ? 'border-t border-slate-100' : ''}
                ${index % 2 !== 0 ? 'md:border-l md:border-slate-100 lg:border-l-0' : ''}
              `}
            >
              <div className="relative">
                <span className="text-[10px] font-bold tracking-widest text-primary/40 block mb-6 transition-transform duration-500 group-hover:translate-x-1">
                  {feature.number}
                </span>
                <h3 className="text-2xl font-heading font-medium text-slate-900 mb-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-slate-500 leading-relaxed font-body text-sm max-w-[280px]">
                  {feature.description}
                </p>
                
                {/* Subtle underline animation */}
                <div className="absolute -bottom-4 left-0 w-0 h-[1px] bg-primary/20 transition-all duration-700 group-hover:w-full" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-24 flex items-center justify-between border-t border-slate-200 pt-12"
        >
          <div className="hidden md:block">
            <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold">
              ESTABLISHED TRADITION — MODERN QUALITY
            </p>
          </div>
          
          <Button
            variant="link"
            className="group p-0 h-auto text-slate-900 hover:no-underline font-bold tracking-widest text-xs flex items-center gap-4"
          >
            <span>DISCOVER OUR STORY</span>
            <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:border-primary group-hover:text-white">
              <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
            </div>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
