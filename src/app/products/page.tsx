"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductListing } from "@/src/components/products";
import { Newsletter } from "@/src/components/newsletter/Newsletter";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function ProductsPage() {
  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Products</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#009744] to-[#00803a] text-white py-12 md:py-16 pt-16 sm:pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">All Products</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Discover our full range of premium organic products and authentic spices
            </p>
          </motion.div>
        </div>
      </div>

      {/* Products Section */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <ProductListing />
      </motion.div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
