"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Sparkles, Check } from "lucide-react";
import { ProductListing } from "@/src/components/products";
import { Newsletter } from "@/src/components/newsletter/Newsletter";

export default function ShopPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors font-medium">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">Shop All Products</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#009744] via-[#00a852] to-[#006b2f] text-white relative overflow-hidden pt-16 sm:pt-20 lg:pt-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag className="h-8 w-8" />
              <span className="text-sm font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                Premium Collection
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Discover Our Premium Selection
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              Explore our carefully curated collection of organic spices and premium products, 
              sourced from the finest producers around the world.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 sm:gap-8"
        >
          {[
            { icon: Sparkles, title: "Premium Quality", desc: "Handpicked from the best sources" },
            { icon: Check, title: "Certified Organic", desc: "100% authentic and pure products" },
            { icon: ShoppingBag, title: "Easy Shopping", desc: "Simple checkout and fast delivery" }
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:border-[#009744]/30"
            >
              <feature.icon className="h-12 w-12 text-[#009744] mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Products */}
      <div className="bg-gray-50 py-12 sm:py-16 lg:py-20">
        <ProductListing />
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
