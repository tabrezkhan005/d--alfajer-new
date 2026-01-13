"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RotateCcw, CheckCircle, Zap, AlertCircle } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { LanguageSelector } from "@/src/components/announcement-bar/LanguageSelector";
import { CurrencySelector } from "@/src/components/announcement-bar/CurrencySelector";

export default function ReturnsPage() {
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
      <div className="bg-white border-b border-gray-200 sticky top-16 sm:top-20 md:top-24 lg:top-28 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 flex justify-end gap-2 sm:gap-3">
          <LanguageSelector language={language} onLanguageChange={setLanguage} />
          <CurrencySelector currency={currency} onCurrencyChange={setCurrency} />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors font-medium">{t('common.home')}</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold truncate">{t('returns.title')}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#009744] via-[#00a852] to-[#006b2f] text-white relative overflow-hidden pt-12 sm:pt-16 md:pt-20 lg:pt-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <RotateCcw className="h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider bg-white/20 px-2 sm:px-3 py-1 rounded-full">{t('returns.satisfaction')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
              {t('returns.title')}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed">
              {t('returns.description')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
        >
          {[
            { icon: Zap, titleKey: "returns.benefit1_title", descKey: "returns.benefit1_desc" },
            { icon: CheckCircle, titleKey: "returns.benefit2_title", descKey: "returns.benefit2_desc" },
            { icon: RotateCcw, titleKey: "returns.benefit3_title", descKey: "returns.benefit3_desc" },
            { icon: AlertCircle, titleKey: "returns.benefit4_title", descKey: "returns.benefit4_desc" }
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-[#009744]/30 transition-all"
            >
              <item.icon className="h-10 sm:h-12 w-10 sm:w-12 text-[#009744] mb-3 sm:mb-4" />
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2">{t(item.titleKey)}</h3>
              <p className="text-gray-500 text-xs sm:text-sm">{t(item.descKey)}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Policy Details */}
      <div className="bg-gray-50 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              { 
                titleKey: "returns.window_title", 
                contentKey: "returns.window_content" 
              },
              { 
                titleKey: "returns.eligibility_title", 
                contentKey: "returns.eligibility_content",
                itemKeys: ["returns.eligibility_item1", "returns.eligibility_item2", "returns.eligibility_item3"]
              },
              { 
                titleKey: "returns.process_title", 
                contentKey: "returns.process_content",
                itemKeys: ["returns.process_item1", "returns.process_item2", "returns.process_item3", "returns.process_item4", "returns.process_item5"]
              },
              { 
                titleKey: "returns.exchange_title", 
                contentKey: "returns.exchange_content" 
              },
              { 
                titleKey: "returns.refund_title", 
                contentKey: "returns.refund_content" 
              }
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
                <p className="text-gray-700 leading-relaxed ml-9 mb-4">{t(section.contentKey)}</p>
                {section.itemKeys && (
                  <ul className="ml-9 space-y-2">
                    {section.itemKeys.map((itemKey, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start gap-2">
                        <span className="text-[#009744] mt-1">✓</span>
                        <span>{t(itemKey)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Cannot Accept */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 md:p-8 lg:p-10"
        >
          <div className="flex items-start gap-2 sm:gap-3 mb-4">
            <AlertCircle className="h-6 sm:h-7 w-6 sm:w-7 text-red-600 flex-shrink-0 mt-0.5" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-red-900">{t('returns.cannotAccept')}</h2>
          </div>
          <ul className="space-y-3 ml-10">
            {[
              "returns.cannotAccept_item1",
              "returns.cannotAccept_item2",
              "returns.cannotAccept_item3",
              "returns.cannotAccept_item4",
              "returns.cannotAccept_item5"
            ].map((itemKey, i) => (
              <li key={i} className="text-red-800 flex items-start gap-2">
                <span className="mt-1">×</span>
                <span>{t(itemKey)}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 md:mb-10 text-center">{t('returns.faq_title')}</h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
          >
            {[
              { qKey: "returns.faq_q1", aKey: "returns.faq_a1" },
              { qKey: "returns.faq_q2", aKey: "returns.faq_a2" },
              { qKey: "returns.faq_q3", aKey: "returns.faq_a3" },
              { qKey: "returns.faq_q4", aKey: "returns.faq_a4" },
              { qKey: "returns.faq_q5", aKey: "returns.faq_a5" },
              { qKey: "returns.faq_q6", aKey: "returns.faq_a6" }
            ].map((faq, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{t(faq.qKey)}</h3>
                <p className="text-gray-700 leading-relaxed">{t(faq.aKey)}</p>
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
