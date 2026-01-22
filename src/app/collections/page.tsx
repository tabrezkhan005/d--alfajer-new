"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Sparkles, Heart, Star, Grid3x3 } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { LanguageSelector } from "@/src/components/announcement-bar/LanguageSelector";
import { CurrencySelector } from "@/src/components/announcement-bar/CurrencySelector";
import { getCategories } from "@/src/lib/supabase/products";
import { createClient } from "@/src/lib/supabase/client";

export default function CollectionsPage() {
  const { language, setLanguage, currency, setCurrency, t } = useI18n();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getCategories();
        
        // Fetch products to check which categories have products
        const supabase = createClient();
        const { data: products } = await supabase
          .from("products")
          .select("category_id")
          .eq("is_active", true);
        
        // Get unique category IDs that have products
        const categoryIdsWithProducts = new Set(
          (products || []).map((p: any) => p.category_id).filter(Boolean)
        );
        
        // Filter categories to only show those with products
        const categoriesWithProducts = categories.filter(cat => 
          categoryIdsWithProducts.has(cat.id)
        );
        
        // Map categories to collection format with icons and colors
        const icons = [Sparkles, Leaf, Heart, Star, Grid3x3];
        const colors = [
          "from-orange-500/20 to-red-500/20",
          "from-amber-500/20 to-yellow-500/20",
          "from-yellow-500/20 to-orange-500/20",
          "from-[#009744]/20 to-green-500/20",
          "from-purple-500/20 to-pink-500/20",
        ];
        const accents = [
          "text-orange-600",
          "text-amber-600",
          "text-yellow-600",
          "text-[#009744]",
          "text-purple-600",
        ];

        const mappedCollections = categoriesWithProducts.map((cat, index) => ({
          id: cat.id,
          name: cat.name,
          titleKey: cat.name,
          descriptionKey: `collections.${cat.name.toLowerCase().replace(/[&\s]+/g, '_')}_desc`,
          icon: icons[index % icons.length],
          color: colors[index % colors.length],
          accent: accents[index % accents.length],
        }));
        
        setCollections(mappedCollections);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* Language & Currency Selector */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-7 lg:px-8 py-2 xs:py-2.5 sm:py-3 flex justify-end gap-2 xs:gap-2.5 sm:gap-3">
          <LanguageSelector language={language} onLanguageChange={setLanguage} />
          <CurrencySelector currency={currency} onCurrencyChange={setCurrency} />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-7 lg:px-8 py-2 xs:py-2.5 sm:py-3">
          <div className="flex items-center gap-2 text-xs xs:text-xs sm:text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors font-medium">{t("common.home")}</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">{t("page.collections")}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#009744] to-[#00803a] text-white py-12 md:py-16 pt-16 sm:pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("collections.title")}</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              {t("collections.description")}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-7 lg:px-8 py-4 xs:py-6 sm:py-8 md:py-10 lg:py-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009744]"></div>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t("collections.noCollections") || "No collections available at the moment."}</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 xs:gap-3.5 sm:gap-4 md:gap-4 lg:gap-5"
          >
            {collections.map((collection) => {
            const Icon = collection.icon;
            return (
              <motion.div
                key={collection.id}
                variants={itemVariants}
                className="group"
              >
                <Link href={`/products?category=${encodeURIComponent(collection.name)}`}>
                  <div className={`bg-gradient-to-br ${collection.color} border border-gray-200 rounded-2xl p-3 xs:p-3.5 sm:p-4 md:p-4 lg:p-5 h-48 xs:h-52 sm:h-56 md:h-60 lg:h-56 flex flex-col items-center justify-center text-center hover:shadow-2xl hover:border-[#009744]/30 transition-all duration-300 transform hover:scale-105 cursor-pointer`}>
                    <div className={`${collection.accent} mb-2 xs:mb-2.5 sm:mb-3 transition-transform group-hover:scale-110`}>
                      <Icon className="w-8 xs:w-10 sm:w-12 lg:w-16 h-8 xs:h-10 sm:h-12 lg:h-16" />
                    </div>
                    <h2 className="text-xs xs:text-sm sm:text-base lg:text-xl font-bold text-gray-900 mb-0.5 xs:mb-1">
                      {t(collection.titleKey)}
                    </h2>
                    <p className="text-gray-700 text-[10px] xs:text-xs sm:text-xs lg:text-sm">{t(collection.descriptionKey)}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
          </motion.div>
        )}

        {/* Featured Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-6 xs:mt-8 sm:mt-10 md:mt-12 lg:mt-14 bg-gradient-to-r from-[#009744] via-[#00a852] to-[#006b2f] rounded-2xl p-5 xs:p-6 sm:p-8 md:p-10 lg:p-12 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute bottom-0 right-0 w-48 xs:w-56 sm:w-64 h-48 xs:h-56 sm:h-64 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative">
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold mb-6 xs:mb-7 sm:mb-8 md:mb-9 lg:mb-10">{t("collections.whyBrowse")}</h2>
            <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 lg:gap-8">
              {[
                {
                  titleKey: "collections.benefit1_title",
                  descriptionKey: "collections.benefit1_desc",
                },
                {
                  titleKey: "collections.benefit2_title",
                  descriptionKey: "collections.benefit2_desc",
                },
                {
                  titleKey: "collections.benefit3_title",
                  descriptionKey: "collections.benefit3_desc",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 xs:p-5 sm:p-6 rounded-xl hover:bg-white/15 transition-all"
                >
                  <h3 className="font-bold text-white mb-2 xs:mb-2.5 sm:mb-3 text-sm xs:text-base sm:text-lg">{t(item.titleKey)}</h3>
                  <p className="text-white/90 text-xs xs:text-sm sm:text-base leading-relaxed">{t(item.descriptionKey)}</p>
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
