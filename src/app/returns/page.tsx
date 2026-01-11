"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RotateCcw, CheckCircle, Zap, AlertCircle } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";

export default function ReturnsPage() {
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
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors font-medium">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">Returns & Exchanges</span>
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
              <RotateCcw className="h-8 w-8" />
              <span className="text-sm font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">100% Satisfaction</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Returns & Exchanges
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              We stand behind every product. Easy returns and exchanges within 30 days, no questions asked.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { icon: Zap, title: "30-Day Window", desc: "Hassle-free returns" },
            { icon: CheckCircle, title: "Full Refund", desc: "Money-back guarantee" },
            { icon: RotateCcw, title: "Easy Exchange", desc: "Swap for anything" },
            { icon: AlertCircle, title: "No Questions", desc: "Instant approval" }
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-[#009744]/30 transition-all"
            >
              <item.icon className="h-12 w-12 text-[#009744] mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Policy Details */}
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
              { 
                title: "30-Day Return Window", 
                content: "You have 30 days from delivery to return your purchase for a refund or exchange. Items must be in original condition with original packaging included." 
              },
              { 
                title: "Return Eligibility", 
                content: "All products are eligible for return except custom orders or items damaged due to misuse.",
                items: ["Product must be unopened or original condition", "Must include original packaging and materials", "Order number or receipt required"]
              },
              { 
                title: "Return Process", 
                content: "Simple 5-step process to get your money back:",
                items: ["Contact support@alfajer.com with your order number", "Provide reason for your return", "Receive prepaid return shipping label", "Ship item back to us", "Refund processed in 5-7 business days"]
              },
              { 
                title: "Exchange Policy", 
                content: "Exchange for a different size, color, or product within 30 days. If you choose a different product, adjust the price difference at checkout." 
              },
              { 
                title: "Refunds & Timing", 
                content: "Once we receive and verify your return, we process your refund to the original payment method within 5-7 business days. Original shipping costs are non-refundable unless the item was damaged or incorrect." 
              }
            ].map((section, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-[#009744] flex-shrink-0 mt-1" />
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>
                <p className="text-gray-700 leading-relaxed ml-9 mb-4">{section.content}</p>
                {section.items && (
                  <ul className="ml-9 space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start gap-2">
                        <span className="text-[#009744] mt-1">✓</span>
                        <span>{item}</span>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6 lg:p-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-7 w-7 text-red-600 flex-shrink-0" />
            <h2 className="text-2xl font-bold text-red-900">We Cannot Accept for Return</h2>
          </div>
          <ul className="space-y-3 ml-10">
            {[
              "Products that have been opened or used",
              "Items without original packaging",
              "Perishable items after 5 days of delivery",
              "Custom or special order items",
              "Items damaged due to customer mishandling"
            ].map((item, i) => (
              <li key={i} className="text-red-800 flex items-start gap-2">
                <span className="mt-1">×</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-10 text-center">Common Questions</h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 gap-6"
          >
            {[
              { q: "How do I start a return?", a: "Email support@alfajer.com with your order number. We'll respond within 24 hours with return shipping instructions." },
              { q: "Who pays for return shipping?", a: "We provide a free prepaid return label so you don't have to pay anything." },
              { q: "How long for refund?", a: "After we receive and verify your return, refunds process in 5-7 business days to your original payment method." },
              { q: "Can I exchange for different size/color?", a: "Absolutely! Exchange within 30 days for any size, color, or different product." },
              { q: "Item arrived damaged?", a: "Contact us immediately with photos. We'll send a replacement or full refund right away." },
              { q: "No shipping refund?", a: "Original shipping is non-refundable unless the item was damaged, defective, or incorrect." }
            ].map((faq, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{faq.q}</h3>
                <p className="text-gray-700 leading-relaxed">{faq.a}</p>
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
