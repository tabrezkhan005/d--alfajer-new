"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";
import { useState } from "react";

export default function FAQPage() {
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
      category: "Ordering & Payment",
      icon: "🛒",
      items: [
        {
          q: "How do I place an order?",
          a: "Browse our products, add items to your cart, proceed to checkout, and follow the payment instructions. You'll receive an order confirmation email immediately.",
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept credit cards, debit cards, digital wallets, and bank transfers. All transactions are secure and encrypted.",
        },
        {
          q: "Can I save my payment information?",
          a: "Yes, you can save your payment information securely for faster checkout on future purchases.",
        },
        {
          q: "Do you offer installment plans?",
          a: "Yes, we offer installment options for orders above AED 500. Details are available during checkout.",
        },
      ],
    },
    {
      category: "Shipping & Delivery",
      icon: "📦",
      items: [
        {
          q: "How long does delivery take?",
          a: "Domestic orders within UAE take 3-5 business days. International orders take 7-14 business days depending on destination.",
        },
        {
          q: "Do you ship internationally?",
          a: "Yes, we ship to most countries worldwide. Shipping costs vary by destination and are calculated at checkout.",
        },
        {
          q: "Can I track my order?",
          a: "Yes, you'll receive a tracking number via email once your order ships. Track it in real-time on our partner's portal.",
        },
        {
          q: "Is free shipping available?",
          a: "Yes! Free shipping on orders above AED 200 within UAE. International orders may have additional fees.",
        },
      ],
    },
    {
      category: "Products & Quality",
      icon: "⭐",
      items: [
        {
          q: "Are your products organic?",
          a: "Yes, all our products are 100% authentic and sourced from premium suppliers. Many are certified organic.",
        },
        {
          q: "How do you ensure product quality?",
          a: "We have strict quality control processes. Every product is inspected before shipping to ensure freshness and quality.",
        },
        {
          q: "How should I store the products?",
          a: "Store in cool, dry places away from direct sunlight. Most products come with storage instructions on the packaging.",
        },
        {
          q: "Are there expiry dates?",
          a: "Yes, all products have expiry dates clearly marked. We always send fresh stock with maximum shelf life remaining.",
        },
      ],
    },
    {
      category: "Returns & Refunds",
      icon: "↩️",
      items: [
        {
          q: "What is your return policy?",
          a: "You can return items within 30 days of delivery for a full refund or exchange. Items must be in original condition.",
        },
        {
          q: "How do I initiate a return?",
          a: "Contact us at support@alfajer.com with your order number. We'll provide return instructions and a prepaid shipping label.",
        },
        {
          q: "How long does a refund take?",
          a: "Once we receive and verify your return, refunds are processed within 5-7 business days.",
        },
        {
          q: "Can I exchange for a different product?",
          a: "Absolutely! You can exchange for the same or different product within 30 days.",
        },
      ],
    },
    {
      category: "Account & Wishlist",
      icon: "👤",
      items: [
        {
          q: "How do I create an account?",
          a: "Click on 'Sign Up' in the top menu, fill in your details, and verify your email. You can start shopping immediately!",
        },
        {
          q: "Can I add items to my wishlist?",
          a: "Yes, click the heart icon on any product to add it to your wishlist. You can view it anytime from your account.",
        },
        {
          q: "How do I update my profile?",
          a: "Go to your Account page and click 'Edit Profile' to update your personal information.",
        },
        {
          q: "How do I change my password?",
          a: "Go to Account > Settings > Change Password. Enter your current password and your new password.",
        },
      ],
    },
    {
      category: "Customer Support",
      icon: "📞",
      items: [
        {
          q: "What are your customer service hours?",
          a: "We provide 24/7 support via email and live chat. Phone support is available 9 AM to 6 PM (UAE time).",
        },
        {
          q: "How can I contact customer service?",
          a: "Email: support@alfajer.com | Phone: +971 4 XXX XXXX | Live Chat on our website",
        },
        {
          q: "What if I have a problem with my order?",
          a: "Contact us immediately with your order number. We'll investigate and resolve any issues quickly.",
        },
        {
          q: "Do you offer bulk orders?",
          a: "Yes! For bulk orders above 50 units, contact our corporate team for special pricing.",
        },
      ],
    },
  ];

  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors font-medium">Home</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">Frequently Asked Questions</span>
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
              <HelpCircle className="h-8 w-8" />
              <span className="text-sm font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">Get Answers</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              Find quick answers to your questions about our products and services.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-12"
        >
          {faqs.map((section, sectionIdx) => (
            <motion.div key={sectionIdx} variants={itemVariants}>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-4xl">{section.icon}</span>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 pb-3 border-b-2 border-[#009744]/30 flex-1">
                  {section.category}
                </h2>
              </div>
              <div className="space-y-4">
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
                        className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-100/50 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 text-left">{faq.q}</h3>
                        <ChevronDown
                          className={`flex-shrink-0 w-5 h-5 text-[#009744] transition-transform duration-300 ${
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
                          className="px-6 py-5 bg-white border-t border-gray-200"
                        >
                          <p className="text-gray-700 leading-relaxed">{faq.a}</p>
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
          className="mt-16 bg-gradient-to-r from-[#009744] via-[#00a852] to-[#006b2f] rounded-xl p-8 lg:p-12 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative text-center">
            <div className="flex justify-center mb-4">
              <MessageSquare className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Still need help?</h2>
            <p className="text-lg text-white/90 mb-8">Can't find what you're looking for? Our support team is here to assist you 24/7.</p>
            <Link
              href="/contact"
              className="inline-block bg-white text-[#009744] hover:bg-gray-100 font-bold py-3 px-10 rounded-lg transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
