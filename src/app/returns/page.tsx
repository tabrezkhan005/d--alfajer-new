"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RotateCcw, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";

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

export default function ReturnsPage() {
  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Returns & Exchanges</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#009744] to-[#00803a] text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Returns & Exchanges</h1>
            <p className="text-lg text-white/90">100% satisfaction guaranteed. Easy returns within 30 days.</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Key Points */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Clock,
                title: "30-Day Return",
                content: "Return within 30 days of purchase",
              },
              {
                icon: CheckCircle,
                title: "Full Refund",
                content: "100% money-back guarantee",
              },
              {
                icon: RotateCcw,
                title: "Easy Exchange",
                content: "Swap for different products",
              },
              {
                icon: AlertCircle,
                title: "No Questions",
                content: "Hassle-free process",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-gradient-to-br from-[#009744]/5 to-[#009744]/10 p-6 rounded-lg text-center hover:shadow-lg transition-shadow"
              >
                <item.icon className="w-12 h-12 text-[#009744] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-700 text-sm">{item.content}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Return Policy */}
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Return Policy</h2>
            <div className="space-y-6">
              {[
                {
                  title: "30-Day Return Window",
                  content:
                    "You have 30 days from the date of delivery to return your purchase for a refund or exchange. Items must be in their original condition with original packaging.",
                },
                {
                  title: "Return Eligibility",
                  content:
                    "All products are eligible for return within 30 days unless they are custom orders or have been damaged due to misuse.",
                  items: ["Product must be unopened or in original condition", "Must include original packaging", "Receipt or order number required"],
                },
                {
                  title: "Return Process",
                  content:
                    "Follow these simple steps to initiate a return:",
                  items: [
                    "Contact our customer service at support@alfajer.com",
                    "Provide your order number and reason for return",
                    "Receive return shipping instructions",
                    "Ship the item back to us prepaid",
                    "Receive refund within 5-7 business days of receipt",
                  ],
                },
                {
                  title: "Exchange Policy",
                  content:
                    "You can exchange products for the same or different item within 30 days. Exchanges can be for the same value or you can adjust the price difference during checkout.",
                },
                {
                  title: "Refund Process",
                  content:
                    "Once we receive and verify your return, we will process your refund to the original payment method within 5-7 business days. Original shipping costs are non-refundable unless the item was damaged or incorrect.",
                },
              ].map((section, idx) => (
                <motion.div key={idx} variants={itemVariants} className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h3>
                  <p className="text-gray-700 mb-3">{section.content}</p>
                  {section.items && (
                    <ul className="list-disc list-inside space-y-2">
                      {section.items.map((item, i) => (
                        <li key={i} className="text-gray-700">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* What We Cannot Accept */}
          <motion.div variants={itemVariants} className="bg-red-50 border border-red-200 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-red-900 mb-4">What We Cannot Accept for Return</h2>
            <ul className="list-disc list-inside space-y-2 text-red-800">
              <li>Products that have been opened or used</li>
              <li>Items without original packaging</li>
              <li>Perishable items after 5 days of delivery</li>
              <li>Custom or special order items</li>
              <li>Items damaged due to customer mishandling</li>
            </ul>
          </motion.div>

          {/* FAQ */}
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: "How do I start a return?",
                  a: "Email us at support@alfajer.com with your order number and reason for return. We'll provide you with return shipping instructions.",
                },
                {
                  q: "Who pays for return shipping?",
                  a: "We provide a prepaid return label so you don't have to pay for return shipping on most items.",
                },
                {
                  q: "How long does a refund take?",
                  a: "Once we receive and verify your return, refunds are processed within 5-7 business days to your original payment method.",
                },
                {
                  q: "Can I exchange for a different size or color?",
                  a: "Yes, you can exchange within 30 days for a different size, color, or even a completely different product.",
                },
                {
                  q: "What if the item arrives damaged?",
                  a: "Contact us immediately with photos. We'll arrange a replacement or full refund right away.",
                },
              ].map((faq, idx) => (
                <motion.div key={idx} variants={itemVariants} className="bg-gradient-to-r from-[#009744]/5 to-[#009744]/10 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-700">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
