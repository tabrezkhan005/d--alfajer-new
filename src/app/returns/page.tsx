"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RotateCcw, CheckCircle, AlertCircle, ShieldCheck, Truck, Sprout } from "lucide-react";
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
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-7 lg:px-8 py-2 xs:py-2.5 sm:py-3 flex justify-end gap-2 xs:gap-2.5 sm:gap-3">
          <LanguageSelector language={language} onLanguageChange={setLanguage} />
          <CurrencySelector currency={currency} onCurrencyChange={setCurrency} />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-7 lg:px-8 py-2 xs:py-2.5 sm:py-3">
          <div className="flex items-center gap-2 text-xs xs:text-xs sm:text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors font-medium">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold truncate">Return & Exchange Policy</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#009744] to-[#00803a] text-white py-12 md:py-16 pt-16 sm:pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-6">Return & Exchange Policy</h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium">
              We currently do not accept returns or exchanges once an order has been delivered.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 space-y-16">

        {/* Why No Returns */}
        <section>
          <div className="flex items-start gap-4 mb-6">
             <div className="p-3 bg-green-50 rounded-full text-[#009744]">
                <Sprout className="h-8 w-8" />
             </div>
             <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Why we don’t offer returns</h2>
                <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                   <p>
                      Our products are sourced directly from farmers and carefully quality-checked before dispatch.
                   </p>
                   <p>
                      To maintain hygiene, freshness, and product integrity, returned items cannot be restocked or resold.
                   </p>
                </div>
             </div>
          </div>
        </section>

        {/* Quality Promise */}
        <section className="bg-gray-50 border border-gray-100 rounded-2xl p-8 md:p-10">
           <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-[#009744]" />
              Our Quality Promise
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                 { text: "Every order is inspected before dispatch", icon: CheckCircle },
                 { text: "Products are securely packed to prevent damage", icon: Truck },
                 { text: "Only genuine, farm-sourced items are shipped", icon: Sprout }
              ].map((item, i) => (
                 <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 text-center shadow-sm">
                    <item.icon className="h-8 w-8 text-[#009744] mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">{item.text}</p>
                 </div>
              ))}
           </div>
        </section>

        {/* Damaged Items */}
        <section>
           <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                 <AlertCircle className="h-8 w-8 text-amber-500" />
                 Damaged or Incorrect Items
              </h2>
              <div className="prose prose-lg text-gray-600 max-w-none">
                 <p className="mb-4">If you receive:</p>
                 <ul className="list-none space-y-2 pl-4 mb-6">
                    <li className="flex items-center gap-3">
                       <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                       A damaged product, or
                    </li>
                    <li className="flex items-center gap-3">
                       <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                       An incorrect item
                    </li>
                 </ul>
                 <p className="font-medium text-gray-900 mb-4">
                    Please contact us within 24 hours of delivery with photos/videos of the issue.
                 </p>
                 <p>
                    We will review and provide a suitable resolution as per our policy (replacement, refund, or store credit).
                 </p>
              </div>
           </div>

           <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
              <p className="text-amber-800 font-medium">
                 Please review product details carefully before placing your order.
              </p>
           </div>
        </section>

        {/* Contact CTA */}
        <div className="text-center pt-8 border-t border-gray-200">
           <p className="text-gray-600 mb-6">Have concerns about your order?</p>
           <Link
             href="/contact"
             className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-[#009744] hover:bg-[#00803a] transition-colors"
           >
             Contact Support
           </Link>
        </div>

      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
