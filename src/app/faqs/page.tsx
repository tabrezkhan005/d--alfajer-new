"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";
import { useState } from "react";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { LanguageSelector } from "@/src/components/announcement-bar/LanguageSelector";
import { CurrencySelector } from "@/src/components/announcement-bar/CurrencySelector";

export default function FAQPage() {
  const { language, setLanguage, currency, setCurrency, t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const faqs = [
    {
      categoryKey: "faq.ordering_category",
      icon: "🛒",
      items: [
        { qKey: "faq.ordering_q1", aKey: "faq.ordering_a1" },
        { qKey: "faq.ordering_q2", aKey: "faq.ordering_a2" },
        { qKey: "faq.ordering_q3", aKey: "faq.ordering_a3" },
        { qKey: "faq.ordering_q4", aKey: "faq.ordering_a4" },
      ],
    },
    {
      categoryKey: "faq.shipping_category",
      icon: "📦",
      items: [
        { qKey: "faq.shipping_q1", aKey: "faq.shipping_a1" },
        { qKey: "faq.shipping_q2", aKey: "faq.shipping_a2" },
        { qKey: "faq.shipping_q3", aKey: "faq.shipping_a3" },
        { qKey: "faq.shipping_q4", aKey: "faq.shipping_a4" },
      ],
    },
    {
      categoryKey: "faq.products_category",
      icon: "⭐",
      items: [
        { qKey: "faq.products_q1", aKey: "faq.products_a1" },
        { qKey: "faq.products_q2", aKey: "faq.products_a2" },
        { qKey: "faq.products_q3", aKey: "faq.products_a3" },
        { qKey: "faq.products_q4", aKey: "faq.products_a4" },
      ],
    },
    {
      categoryKey: "faq.returns_category",
      icon: "↩️",
      items: [
        { qKey: "faq.returns_q1", aKey: "faq.returns_a1" },
        { qKey: "faq.returns_q2", aKey: "faq.returns_a2" },
        { qKey: "faq.returns_q3", aKey: "faq.returns_a3" },
        { qKey: "faq.returns_q4", aKey: "faq.returns_a4" },
      ],
    },
    {
      categoryKey: "faq.account_category",
      icon: "👤",
      items: [
        { qKey: "faq.account_q1", aKey: "faq.account_a1" },
        { qKey: "faq.account_q2", aKey: "faq.account_a2" },
        { qKey: "faq.account_q3", aKey: "faq.account_a3" },
        { qKey: "faq.account_q4", aKey: "faq.account_a4" },
      ],
    },
    {
      categoryKey: "faq.support_category",
      icon: "📞",
      items: [
        { qKey: "faq.support_q1", aKey: "faq.support_a1" },
        { qKey: "faq.support_q2", aKey: "faq.support_a2" },
        { qKey: "faq.support_q3", aKey: "faq.support_a3" },
        { qKey: "faq.support_q4", aKey: "faq.support_a4" },
      ],
    },
  ];

  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* Language & Currency Selector */}
      <div className="bg-white border-b border-gray-200 sticky top-16 sm:top-20 md:top-24 lg:top-28 z-30">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-7 lg:px-8 py-2 xs:py-2.5 sm:py-3 flex justify-end gap-2 xs:gap-2.5 sm:gap-3">
          <LanguageSelector language={language} onLanguageChange={setLanguage} />
          <CurrencySelector currency={currency} onCurrencyChange={setCurrency} />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-7 lg:px-8 py-2 xs:py-2.5 sm:py-3">
          <div className="flex items-center gap-2 text-xs xs:text-xs sm:text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors font-medium">{t('common.home')}</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold truncate">{t('faq.title')}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#009744] via-[#00a852] to-[#006b2f] text-white relative overflow-hidden pt-20 xs:pt-24 sm:pt-28 md:pt-32 lg:pt-36">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-48 xs:w-56 sm:w-64 md:w-80 lg:w-96 h-48 xs:h-56 sm:h-64 md:h-80 lg:h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-7 lg:px-8 py-12 xs:py-14 sm:py-16 md:py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-3 xs:mb-4">
              <HelpCircle className="h-6 xs:h-7 sm:h-8 md:h-8 w-6 xs:w-7 sm:w-8 md:w-8 flex-shrink-0" />
              <span className="text-xs xs:text-xs sm:text-sm font-semibold uppercase tracking-wider bg-white/20 px-2 xs:px-2.5 sm:px-3 py-1 rounded-full">{t('faq.getAnswers')}</span>
            </div>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 xs:mb-3.5 sm:mb-4 leading-tight">
              {t('faq.title')}
            </h1>
            <p className="text-sm xs:text-base sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed">
              {t('faq.hero_description')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 md:px-7 lg:px-8 py-8 xs:py-10 sm:py-12 md:py-16 lg:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-6 xs:space-y-7 sm:space-y-8 md:space-y-10 lg:space-y-12"
        >
          {faqs.map((section, sectionIdx) => (
            <motion.div key={sectionIdx} variants={itemVariants}>
              <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3 mb-4 xs:mb-5 sm:mb-6 md:mb-7 lg:mb-8">
                <span className="text-2xl xs:text-2xl sm:text-3xl md:text-4xl flex-shrink-0">{section.icon}</span>
                <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 pb-2 xs:pb-2.5 sm:pb-3 border-b-2 border-[#009744]/30 flex-1">
                  {t(section.categoryKey)}
                </h2>
              </div>
              <div className="space-y-2 xs:space-y-2.5 sm:space-y-3 md:space-y-4">
                {section.items.map((faq, idx) => {
                  const globalIdx = faqs.slice(0, sectionIdx).reduce((sum, s) => sum + s.items.length, 0) + idx;
                  return (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-[#009744]/30 transition-all"
                    >
                      <button
                        onClick={() => setOpenIndex(openIndex === globalIdx ? null : globalIdx)}
                        className="w-full px-3 xs:px-3.5 sm:px-4 md:px-6 py-3 xs:py-3.5 sm:py-4 md:py-5 flex items-start sm:items-center justify-between gap-2 hover:bg-gray-100/50 transition-colors"
                      >
                        <h3 className="text-xs xs:text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-900 text-left">{t(faq.qKey)}</h3>
                        <ChevronDown
                          className={`flex-shrink-0 w-4 xs:w-4 sm:w-5 h-4 xs:h-4 sm:h-5 text-[#009744] transition-transform duration-300 ${
                            openIndex === globalIdx ? "transform rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openIndex === globalIdx && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-3 xs:px-3.5 sm:px-4 md:px-6 py-3 xs:py-3.5 sm:py-4 md:py-5 bg-white border-t border-gray-200"
                        >
                          <p className="text-xs xs:text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">{t(faq.aKey)}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 xs:mt-14 sm:mt-16 md:mt-20 lg:mt-24 bg-gradient-to-r from-[#009744] via-[#00a852] to-[#006b2f] rounded-xl p-6 xs:p-7 sm:p-8 md:p-10 lg:p-12 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute bottom-0 right-0 w-40 xs:w-48 sm:w-64 h-40 xs:h-48 sm:h-64 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative text-center">
            <div className="flex justify-center mb-3 xs:mb-4">
              <MessageSquare className="h-8 xs:h-8 sm:h-9 md:h-10 w-8 xs:w-8 sm:w-9 md:w-10" />
            </div>
            <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 xs:mb-2.5 sm:mb-3">{t('faq.stillNeed')}</h2>
            <p className="text-xs xs:text-xs sm:text-base md:text-lg text-white/90 mb-6 xs:mb-6 sm:mb-8">{t('faq.stillNeedDesc')}</p>
            <Link
              href="/contact"
              className="inline-block bg-white text-[#009744] hover:bg-gray-100 font-bold py-2 xs:py-2.5 sm:py-3 px-6 xs:px-7 sm:px-8 md:px-10 rounded-lg transition-colors text-xs xs:text-sm sm:text-base"
            >
              {t('faq.contactUs')}
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
