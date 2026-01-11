"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";
import { useState } from "react";

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

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      category: "Ordering & Payment",
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">FAQ</span>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-white/90">Find answers to common questions about our products and services</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {faqs.map((section, sectionIdx) => (
            <motion.div key={sectionIdx} variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-[#009744]">
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.items.map((faq, idx) => {
                  const globalIdx = faqs.slice(0, sectionIdx).reduce((sum, s) => sum + s.items.length, 0) + idx;
                  return (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <button
                        onClick={() => setOpenIndex(openIndex === globalIdx ? null : globalIdx)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 text-left">{faq.q}</h3>
                        <ChevronDown
                          className={`flex-shrink-0 w-5 h-5 text-[#009744] transition-transform ${
                            openIndex === globalIdx ? "transform rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openIndex === globalIdx && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-6 py-4 bg-white border-t border-gray-200"
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
          variants={itemVariants}
          className="mt-16 bg-gradient-to-r from-[#009744]/10 to-[#009744]/5 p-8 rounded-lg text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Still need help?</h2>
          <p className="text-gray-700 mb-6">Can't find what you're looking for? Our support team is here to help!</p>
          <Link
            href="/contact"
            className="inline-block bg-[#009744] hover:bg-[#007A37] text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Contact Us
          </Link>
        </motion.div>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
