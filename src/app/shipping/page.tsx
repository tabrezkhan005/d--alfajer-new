"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Truck, MapPin, Clock, Package, CheckCircle, Globe } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { LanguageSelector } from "@/src/components/announcement-bar/LanguageSelector";
import { CurrencySelector } from "@/src/components/announcement-bar/CurrencySelector";

export default function ShippingPage() {
  const { language, setLanguage, currency, setCurrency, t } = useI18n();
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-end gap-3">
          <LanguageSelector language={language} onLanguageChange={setLanguage} />
          <CurrencySelector currency={currency} onCurrencyChange={setCurrency} />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors font-medium">{t('common.home')}</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">{t('shipping.title')}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#009744] via-[#00a852] to-[#006b2f] text-white relative overflow-hidden pt-44 sm:pt-48 md:pt-52 lg:pt-56">
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
              <Truck className="h-8 w-8" />
              <span className="text-sm font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">{t('shipping.fastReliable')}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {t('shipping.title')}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              {t('shipping.description')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Shipping Options */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { icon: Truck, titleKey: "shipping.domestic_title", timeKey: "shipping.domestic_time", priceKey: "shipping.domestic_price" },
            { icon: Globe, titleKey: "shipping.international_title", timeKey: "shipping.international_time", priceKey: "shipping.international_price" },
            { icon: Clock, titleKey: "shipping.express_title", timeKey: "shipping.express_time", priceKey: "shipping.express_price" },
            { icon: Package, titleKey: "shipping.tracking_title", timeKey: "shipping.tracking_time", priceKey: "shipping.tracking_price" }
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-[#009744]/30 transition-all"
            >
              <item.icon className="h-12 w-12 text-[#009744] mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t(item.titleKey)}</h3>
              <p className="text-gray-900 font-semibold text-sm mb-1">{t(item.timeKey)}</p>
              <p className="text-gray-500 text-xs">{t(item.priceKey)}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Details */}
      <div className="bg-gray-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              { titleKey: "shipping.domestic_detail_title", contentKey: "shipping.domestic_detail_content" },
              { titleKey: "shipping.international_detail_title", contentKey: "shipping.international_detail_content" },
              { titleKey: "shipping.costs_title", contentKey: "shipping.costs_content" },
              { titleKey: "shipping.tracking_detail_title", contentKey: "shipping.tracking_detail_content" },
              { titleKey: "shipping.address_title", contentKey: "shipping.address_content" },
              { titleKey: "shipping.handling_title", contentKey: "shipping.handling_content" }
            ].map((section, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-[#009744] flex-shrink-0 mt-1" />
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{t(section.titleKey)}</h2>
                </div>
                <p className="text-gray-700 leading-relaxed ml-9">{t(section.contentKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
