"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Truck, MapPin, Clock, Package, CheckCircle, Globe } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";

export default function ShippingPage() {
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
            <span className="text-gray-900 font-semibold">Shipping Policy</span>
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
              <Truck className="h-8 w-8" />
              <span className="text-sm font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">Fast & Reliable Delivery</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Shipping Policy
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              We deliver worldwide with transparent pricing, real-time tracking, and 100% care for your orders.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Shipping Options */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { icon: Truck, title: "Domestic (UAE)", time: "3-5 days", price: "Free on AED 200+" },
            { icon: Globe, title: "International", time: "7-14 days", price: "Calculated at checkout" },
            { icon: Clock, title: "Express", time: "Next day", price: "Select areas" },
            { icon: Package, title: "Tracking", time: "Real-time", price: "Free for all" }
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-[#009744]/30 transition-all"
            >
              <item.icon className="h-12 w-12 text-[#009744] mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-900 font-semibold text-sm mb-1">{item.time}</p>
              <p className="text-gray-500 text-xs">{item.price}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Details */}
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
              { title: "Domestic Shipping (UAE)", content: "Orders are processed within 1-2 business days. Delivery takes 3-5 business days depending on location. Free shipping on orders above AED 200." },
              { title: "International Shipping", content: "We ship to most countries worldwide. International orders are processed within 2-3 days and arrive within 7-14 business days depending on destination and customs." },
              { title: "Shipping Costs", content: "Costs are calculated based on destination, weight, and size. You'll see exact shipping costs during checkout before purchase." },
              { title: "Order Tracking", content: "Receive a tracking number via email once your order ships. Track your package in real-time on our partner's portal." },
              { title: "Delivery Address", content: "Ensure your delivery address is complete and accurate. We're not responsible for packages delivered to incorrect addresses." },
              { title: "Handling & Packaging", content: "All orders are carefully packed to ensure perfect condition. Every package is insured and handled with care by our logistics partners." }
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
                <p className="text-gray-700 leading-relaxed ml-9">{section.content}</p>
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
