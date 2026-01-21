"use client";

import { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ProductListing } from "@/src/components/products";
import { Newsletter } from "@/src/components/newsletter/Newsletter";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { LanguageSelector } from "@/src/components/announcement-bar/LanguageSelector";
import { CurrencySelector } from "@/src/components/announcement-bar/CurrencySelector";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function ProductsPage() {
  const { language, setLanguage, currency, setCurrency, t } = useI18n();

  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* Language & Currency Selector */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex justify-end gap-3">
          <LanguageSelector language={language} onLanguageChange={setLanguage} />
          <CurrencySelector currency={currency} onCurrencyChange={setCurrency} />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors">
              {t("common.home")}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{t("page.shop")}</span>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("page.shop")}</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              {t("productPage.description")}
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
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading products...</div>}>
          <ProductListing />
        </Suspense>
      </motion.div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
