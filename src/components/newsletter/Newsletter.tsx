"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

export function Newsletter() {
  return (
    <section className="py-24 bg-[#FAFAFA] border-t border-b border-black/5 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <span className="text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase text-primary mb-4 block">
              The Al Fajr Journal
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading text-[#1A1A1A] mb-6 tracking-tight">
              Curated Wisdom, Delivered.
            </h2>
            <p className="text-sm md:text-base text-black/50 max-w-lg mx-auto leading-relaxed font-body">
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
              className="max-w-xl mx-auto"
            >
              <div className="relative group flex flex-col sm:flex-row items-stretch gap-3">
                <div className="relative flex-grow">
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    className="h-14 bg-white border-black/10 focus:border-success/30 rounded-none px-6 text-sm font-body transition-all duration-300 placeholder:text-black/20 focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
                  <div className="absolute bottom-0 left-0 h-[1px] bg-success w-0 group-focus-within:w-full transition-all duration-500" />
                </div>
                <Button 
                  type="submit" 
                  className="h-14 px-10 bg-primary hover:bg-primary/90 text-white rounded-none text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-500 group overflow-hidden relative"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Subscribe
                    <Send className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                  />
                </Button>
              </div>
              <p className="text-[10px] text-center text-black/30 mt-6 tracking-widest uppercase font-medium">
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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-success/10 via-primary/5 to-transparent rounded-full blur-[120px] pointer-events-none"
      />
    </section>
  );
}
