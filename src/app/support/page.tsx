"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Mail, MessageSquare, Phone, MapPin, Clock, ChevronDown, Send, Headset } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { Newsletter } from "@/src/components/newsletter/Newsletter";
import { LanguageSelector } from "@/src/components/announcement-bar/LanguageSelector";
import { CurrencySelector } from "@/src/components/announcement-bar/CurrencySelector";

export default function SupportPage() {
  const { t, language, setLanguage, currency, setCurrency } = useI18n();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const contactMethods = [
    {
      icon: Mail,
      title: t("support.email_support"),
      value: "support@alfajer.ae",
      description: t("support.email_description"),
    },
    {
      icon: Phone,
      title: t("support.phone_support"),
      value: "+971 4 XXX XXXX",
      description: t("support.phone_description"),
    },
    {
      icon: MessageSquare,
      title: t("support.live_chat"),
      value: t("support.available_24_7"),
      description: t("support.chat_description"),
    },
    {
      icon: MapPin,
      title: t("support.visit_us"),
      value: t("support.location"),
      description: t("support.visit_description"),
    },
  ];

  const faqs = [
    {
      question: t("support.faq_return_policy_q"),
      answer: t("support.faq_return_policy_a"),
    },
    {
      question: t("support.faq_shipping_q"),
      answer: t("support.faq_shipping_a"),
    },
    {
      question: t("support.faq_organic_q"),
      answer: t("support.faq_organic_a"),
    },
    {
      question: t("support.faq_international_q"),
      answer: t("support.faq_international_a"),
    },
    {
      question: t("support.faq_track_q"),
      answer: t("support.faq_track_a"),
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
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
            <Link href="/" className="hover:text-[#009744] transition-colors font-medium">{t("common.home")}</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold truncate">{t("support.title")}</span>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("support.customer_support")}</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              {t("support.hero_description")}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-12 sm:mb-16"
        >
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-[#009744]/30 transition-all"
              >
                <Icon className="h-10 sm:h-12 w-10 sm:w-12 text-[#009744] mb-3 sm:mb-4" />
                <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-[#009744] font-semibold text-xs sm:text-sm mb-1">{method.value}</p>
                <p className="text-gray-500 text-xs">{method.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Contact Form & FAQ Split */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 sm:p-6 md:p-8"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">{t("support.send_message")}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("common.name")}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition"
                    placeholder={t("support.placeholder_name")}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("common.email")}
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition"
                    placeholder={t("support.placeholder_email")}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("support.subject")}
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition"
                  placeholder={t("support.placeholder_subject")}
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("support.message")}
                </label>
                <textarea
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition resize-none"
                  placeholder={t("support.placeholder_message")}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#009744] hover:bg-[#007A37] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Send size={18} />
                {t("support.send_message_btn")}
              </Button>
            </form>
          </motion.div>

          {/* FAQs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">{t("support.quick_answers")}</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-[#009744]/30 transition-all"
                >
                  <button
                    onClick={() =>
                      setExpandedFaq(expandedFaq === index ? null : index)
                    }
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 text-left text-sm lg:text-base">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`text-[#009744] flex-shrink-0 transition-transform ${
                        expandedFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 px-6 py-4 bg-white"
                    >
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
