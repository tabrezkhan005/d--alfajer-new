"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Sparkles, Check } from "lucide-react";
import { ProductListing } from "@/src/components/products";
import { Newsletter } from "@/src/components/newsletter/Newsletter";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { LanguageSelector } from "@/src/components/announcement-bar/LanguageSelector";
import { CurrencySelector } from "@/src/components/announcement-bar/CurrencySelector";

export default function ShopPage() {
  const { language, setLanguage, currency, setCurrency, t } = useI18n();
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
            <Link href="/" className="hover:text-[#009744] transition-colors font-medium">
              {t("common.home")}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">{t("page.shop")}</span>
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
                {t("shop.premiumCollection")}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {t("shop.discoverPremium")}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              {t("shop.exploreCollection")}
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
            { icon: Sparkles, titleKey: "shop.quality_title", descKey: "shop.quality_desc" },
            { icon: Check, titleKey: "shop.certified_title", descKey: "shop.certified_desc" },
            { icon: ShoppingBag, titleKey: "shop.shopping_title", descKey: "shop.shopping_desc" }
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:border-[#009744]/30"
            >
              <feature.icon className="h-12 w-12 text-[#009744] mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t(feature.titleKey)}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{t(feature.descKey)}</p>
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
