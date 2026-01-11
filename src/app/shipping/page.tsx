"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Truck, MapPin, Clock, DollarSign } from "lucide-react";
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

export default function ShippingPage() {
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
            <span className="text-gray-900 font-medium">Shipping Policy</span>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Shipping Policy</h1>
            <p className="text-lg text-white/90">Fast, secure and reliable delivery worldwide</p>
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
          {/* Shipping Info Cards */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Truck,
                title: "Domestic Shipping",
                content: "3-5 business days",
                price: "Free on orders above AED 200",
              },
              {
                icon: MapPin,
                title: "International",
                content: "7-14 business days",
                price: "Calculated at checkout",
              },
              {
                icon: Clock,
                title: "Express Delivery",
                content: "Next day delivery",
                price: "Available in select areas",
              },
              {
                icon: DollarSign,
                title: "Tracking",
                content: "Real-time updates",
                price: "Free for all orders",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-gradient-to-br from-[#009744]/5 to-[#009744]/10 p-6 rounded-lg text-center hover:shadow-lg transition-shadow"
              >
                <item.icon className="w-12 h-12 text-[#009744] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-700 font-medium mb-1">{item.content}</p>
                <p className="text-sm text-gray-600">{item.price}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Details */}
          <motion.div variants={itemVariants} className="space-y-8">
            {[
              {
                title: "Domestic Shipping (UAE)",
                content:
                  "Orders placed within the UAE are processed and shipped within 1-2 business days. Delivery typically takes 3-5 business days depending on your location. Free shipping is available on orders above AED 200.",
              },
              {
                title: "International Shipping",
                content:
                  "We ship to most countries worldwide. International orders are processed within 2-3 business days and typically arrive within 7-14 business days depending on the destination country and customs.",
              },
              {
                title: "Shipping Costs",
                content:
                  "Shipping costs are calculated based on the destination, weight, and size of the package. You will see the exact shipping cost during checkout before completing your purchase.",
              },
              {
                title: "Order Tracking",
                content:
                  "Once your order is shipped, you will receive a tracking number via email. You can track your package in real-time using this number on our partner's tracking portal.",
              },
              {
                title: "Delivery Address",
                content:
                  "Please ensure that your delivery address is complete and accurate. We are not responsible for packages delivered to incorrect addresses provided by the customer.",
              },
              {
                title: "Handling & Processing",
                content:
                  "Orders are carefully packed to ensure the products reach you in perfect condition. All packages are insured and handled with care by our logistics partners.",
              },
            ].map((section, idx) => (
              <motion.div key={idx} variants={itemVariants} className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
                <p className="text-gray-700 leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* FAQ */}
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Can I change my shipping address after placing an order?",
                  a: "Contact us immediately if you need to change your address. We can modify it if the order hasn't been shipped yet.",
                },
                {
                  q: "What if my package is damaged?",
                  a: "All packages are insured. If you receive a damaged package, contact us immediately with photos for a full replacement or refund.",
                },
                {
                  q: "Do you offer PO Box shipping?",
                  a: "Yes, we can ship to PO boxes for both domestic and some international addresses.",
                },
                {
                  q: "Can I schedule a specific delivery date?",
                  a: "While we cannot guarantee specific dates, we do our best to meet delivery timelines. Contact us for special arrangements.",
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
