"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, ArrowRight } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { LanguageSelector } from "@/src/components/announcement-bar/LanguageSelector";
import { CurrencySelector } from "@/src/components/announcement-bar/CurrencySelector";

export default function ContactPage() {
  const { language, setLanguage, currency, setCurrency, t } = useI18n();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", email: "", subject: "", message: "" });
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
            <Link href="/" className="hover:text-[#009744] transition-colors font-medium">
              {t('common.home')}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold truncate">{t('page.contact')}</span>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('contact.title')}</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              {t('contact.subtitle')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
        >
          {[
            { icon: Mail, title: t('contact.emailSupport'), content: "support@alfajer.com", desc: t('contact.sendEmail') },
            { icon: Phone, title: t('contact.phoneSupport'), content: "+971 4 XXX XXXX", desc: t('contact.businessHours') },
            { icon: MapPin, title: t('contact.visitUs'), content: "Dubai, UAE", desc: t('contact.visitStore') },
            { icon: Clock, title: t('page.support'), content: "24/7", desc: t('contact.liveChat') }
          ].map((info, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-[#009744]/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <info.icon className="h-8 sm:h-10 w-8 sm:w-10 text-[#009744]" />
              </div>
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
              <p className="text-xs sm:text-sm text-gray-900 font-semibold mb-1">{info.content}</p>
              <p className="text-xs sm:text-sm text-gray-500">{info.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Contact Form & FAQ */}
      <div className="bg-gray-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-8 lg:gap-12"
          >
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 lg:p-10 rounded-2xl border border-gray-200 shadow-sm"
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{t('contact.form')}</h2>
              <p className="text-gray-600 mb-8">{t('contact.sendEmail')}</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('common.name')} *</label>
                  <input
                    type="text"
                    required
                    placeholder={t('contact.name')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('common.email')} *</label>
                  <input
                    type="email"
                    required
                    placeholder={t('contact.email')}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('contact.subject')} *</label>
                  <input
                    type="text"
                    required
                    placeholder={t('contact.subject')}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('contact.message')} *</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition resize-none"
                    placeholder={t('contact.message')}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#009744] hover:bg-[#007A37] text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" /> {t('contact.send')}
                </Button>
                {submitted && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 text-sm font-semibold">
                    ✓ {t('common.success')}!
                  </motion.p>
                )}
              </form>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{t('faq.title')}</h2>
              <p className="text-gray-600 mb-8">{t('faq.description')}</p>
              <div className="space-y-4">
                {[
                  { q: t('faq.delivery_q'), a: t('faq.delivery_a') },
                  { q: t('faq.shipping_q'), a: t('faq.shipping_a') },
                  { q: t('faq.satisfaction_q'), a: t('faq.satisfaction_a') },
                  { q: t('faq.organic_q'), a: t('faq.organic_a') },
                ].map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-lg border border-gray-200 hover:border-[#009744]/30 transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <ArrowRight className="h-5 w-5 text-[#009744] mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                      <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed ml-8">{faq.a}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
