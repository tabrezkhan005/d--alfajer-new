"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, Sparkles, Heart, Star, Grid3x3, ArrowRight } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { LanguageSelector } from "@/src/components/announcement-bar/LanguageSelector";
import { CurrencySelector } from "@/src/components/announcement-bar/CurrencySelector";

export default function CollectionsPage() {
  const { language, setLanguage, currency, setCurrency, t } = useI18n();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const collections = [
    {
      id: 1,
      title: "Premium Spices",
      description: "Hand-selected premium spices from around the world",
      icon: Sparkles,
      items: 12,
      color: "from-orange-500/20 to-red-500/20",
      accent: "text-orange-600",
    },
    {
      id: 2,
      title: "Organic Dry Fruits",
      description: "100% organic certified dry fruits and nuts",
      icon: Leaf,
      items: 15,
      color: "from-amber-500/20 to-yellow-500/20",
      accent: "text-amber-600",
    },
    {
      id: 3,
      title: "Honey Collection",
      description: "Pure, raw honey from trusted sources",
      icon: Heart,
      items: 8,
      color: "from-yellow-500/20 to-orange-500/20",
      accent: "text-yellow-600",
    },
    {
      id: 4,
      title: "Premium Selections",
      description: "Curated selection of our best sellers",
      icon: Star,
      items: 20,
      color: "from-[#009744]/20 to-green-500/20",
      accent: "text-[#009744]",
    },
  ];

  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* Language & Currency Selector */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-end gap-3">
          <LanguageSelector language={language} onLanguageChange={setLanguage} />
          <CurrencySelector currency={currency} onCurrencyChange={setCurrency} />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors font-medium">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">Collections</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#009744] via-[#00a852] to-[#006b2f] text-white relative overflow-hidden pt-16 sm:pt-20 lg:pt-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <Grid3x3 className="h-8 w-8" />
              <span className="text-sm font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">Browse by Category</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Our Collections
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              Explore our expertly curated collections of premium products organized by category for easy browsing.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 gap-6 lg:gap-8"
        >
          {collections.map((collection) => {
            const Icon = collection.icon;
            return (
              <motion.div
                key={collection.id}
                variants={itemVariants}
                className="group"
              >
                <Link href={`/collections/${collection.id}`}>
                  <div className={`bg-gradient-to-br ${collection.color} border border-gray-200 rounded-2xl p-8 lg:p-12 h-72 flex flex-col items-center justify-center text-center hover:shadow-2xl hover:border-[#009744]/30 transition-all duration-300 transform hover:scale-105`}>
                    <div className={`${collection.accent} mb-6 transition-transform group-hover:scale-110`}>
                      <Icon className="w-16 h-16 lg:w-20 lg:h-20" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                      {collection.title}
                    </h2>
                    <p className="text-gray-700 mb-6 text-sm lg:text-base">{collection.description}</p>
                    <div className="flex items-center gap-2 text-[#009744] font-semibold group-hover:gap-3 transition-all">
                      <span>{collection.items} Products</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Featured Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 lg:mt-20 bg-gradient-to-r from-[#009744] via-[#00a852] to-[#006b2f] rounded-2xl p-8 lg:p-12 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative">
            <h2 className="text-3xl lg:text-4xl font-bold mb-8 lg:mb-10">Why Browse Our Collections?</h2>
            <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  title: "Organized Selection",
                  description: "Easily find exactly what you're looking for by browsing our carefully curated categories",
                },
                {
                  title: "Quality Assured",
                  description: "Every product in our collections meets our strict standards for freshness and authenticity",
                },
                {
                  title: "Expert Curation",
                  description: "Our team hand-selects products to ensure you get the best of each category",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl hover:bg-white/15 transition-all"
                >
                  <h3 className="font-bold text-white mb-2 text-lg">{item.title}</h3>
                  <p className="text-white/90 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
