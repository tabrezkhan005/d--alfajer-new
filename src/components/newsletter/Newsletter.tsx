"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

export function Newsletter() {
  return (
    <section className="w-full py-6 xs:py-8 sm:py-10 md:py-14 lg:py-20 xl:py-24 bg-[#FAFAFA] border-t border-b border-black/5 overflow-x-hidden">
      <div className="container mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-3 xs:mb-4 sm:mb-6 md:mb-8 lg:mb-10 xl:mb-12"
          >
            <span className="text-[6px] xs:text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] font-semibold tracking-[0.3em] uppercase text-primary mb-1 xs:mb-1.5 sm:mb-2 md:mb-2.5 lg:mb-4 block">
              The Al Fajr Journal
            </span>
            <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-heading text-[#1A1A1A] mb-1.5 xs:mb-2 sm:mb-3 md:mb-4 lg:mb-6 tracking-tight px-2 sm:px-0">
              Curated Wisdom, Delivered.
            </h2>
            <p className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-xs lg:text-sm text-black/50 max-w-lg mx-auto leading-relaxed font-body px-2 sm:px-0">
              Join our community for exclusive harvest updates, seasonal collections, 
              and the philosophy of premium dates.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <form 
              onSubmit={(e) => e.preventDefault()}
              className="max-w-xl mx-auto px-2 xs:px-3 sm:px-4"
            >
              <div className="relative group flex flex-col xs:flex-col sm:flex-row items-stretch gap-1 xs:gap-1.5 sm:gap-2 md:gap-3">
                <div className="relative flex-grow">
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    className="h-8 xs:h-9 sm:h-10 md:h-11 lg:h-12 bg-white border-black/10 focus:border-success/30 rounded-none px-2 xs:px-2.5 sm:px-3 md:px-4 lg:px-6 text-[8px] xs:text-[9px] sm:text-xs md:text-sm lg:text-base font-body transition-all duration-300 placeholder:text-black/20 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                    required
                  />
                  <div className="absolute bottom-0 left-0 h-[1px] bg-success w-0 group-focus-within:w-full transition-all duration-500" />
                </div>
                <Button 
                  type="submit" 
                  className="h-8 xs:h-9 sm:h-10 md:h-11 lg:h-12 px-2.5 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 bg-primary hover:bg-primary/90 text-white rounded-none text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] md:tracking-[0.2em] transition-all duration-500 group overflow-hidden relative whitespace-nowrap flex-shrink-0 w-full sm:w-auto"
                >
                  <span className="relative z-10 flex items-center gap-0.5 sm:gap-0.75 md:gap-1 lg:gap-2 justify-center">
                    Subscribe
                    <Send className="w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                  />
                </Button>
              </div>
              <p className="text-[6px] xs:text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] text-center text-black/30 mt-1.5 xs:mt-2 sm:mt-3 md:mt-4 lg:mt-6 tracking-widest uppercase font-medium">
                Privileged access to our finest harvests.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
      
      {/* Subtle Background Animation Element */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.08, 0.05]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] xs:w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[800px] h-[250px] xs:h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[800px] bg-gradient-to-r from-success/10 via-primary/5 to-transparent rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] lg:blur-[120px] pointer-events-none"
      />
    </section>
  );
}
