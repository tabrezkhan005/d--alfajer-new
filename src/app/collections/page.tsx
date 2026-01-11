"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, Sparkles, Heart, Star } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function CollectionsPage() {
  const collections = [
    {
      id: 1,
      title: "Premium Spices",
      description: "Hand-selected premium spices from around the world",
      icon: Sparkles,
      items: 12,
      image: "bg-gradient-to-br from-orange-500/20 to-red-500/20",
    },
    {
      id: 2,
      title: "Organic Dry Fruits",
      description: "100% organic certified dry fruits and nuts",
      icon: Leaf,
      items: 15,
      image: "bg-gradient-to-br from-amber-500/20 to-yellow-500/20",
    },
    {
      id: 3,
      title: "Honey Collection",
      description: "Pure, raw honey from trusted sources",
      icon: Heart,
      items: 8,
      image: "bg-gradient-to-br from-yellow-500/20 to-orange-500/20",
    },
    {
      id: 4,
      title: "Premium Selections",
      description: "Curated selection of our best sellers",
      icon: Star,
      items: 20,
      image: "bg-gradient-to-br from-[#009744]/20 to-green-500/20",
    },
  ];

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
            <span className="text-gray-900 font-medium">Collections</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#009744] to-[#00803a] text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Collections</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Explore our curated collections of premium products organized by category
            </p>
          </motion.div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-8"
        >
          {collections.map((collection) => (
            <motion.div
              key={collection.id}
              variants={itemVariants}
              className="group cursor-pointer"
            >
              <Link href={`/collections/${collection.id}`}>
                <div className={`${collection.image} rounded-lg p-12 h-64 flex flex-col items-center justify-center text-center hover:shadow-xl transition-all duration-300 transform group-hover:scale-105`}>
                  <collection.icon className="w-16 h-16 text-[#009744] mb-4" />
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {collection.title}
                  </h2>
                  <p className="text-gray-700 mb-4">{collection.description}</p>
                  <p className="text-sm font-semibold text-[#009744]">
                    {collection.items} Products
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured Section */}
        <motion.div
          variants={itemVariants}
          className="mt-16 bg-gradient-to-r from-[#009744]/10 to-[#009744]/5 p-8 md:p-12 rounded-lg"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Browse Our Collections?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Organized Selection",
                description: "Easily find exactly what you're looking for by browsing our curated collections",
              },
              {
                title: "Quality Assured",
                description: "Every product in our collections meets our strict quality standards",
              },
              {
                title: "Expert Curation",
                description: "Our team carefully selects products to ensure the best of each category",
              },
            ].map((item, idx) => (
              <motion.div key={idx} variants={itemVariants} className="bg-white p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
