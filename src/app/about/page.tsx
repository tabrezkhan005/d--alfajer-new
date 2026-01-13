"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Award, Globe, Truck, Leaf, Zap } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";

export default function AboutPage() {
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
            <span className="text-gray-900 font-semibold">About Us</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#009744] via-[#00a852] to-[#006b2f] text-white relative overflow-hidden pt-44 sm:pt-48 md:pt-52 lg:pt-56">
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
              <Leaf className="h-8 w-8" />
              <span className="text-sm font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">Our Story</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              About Alfajer
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              Bringing premium organic products from around the world directly to your home since day one.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-16 lg:space-y-20"
        >
          {/* Our Story */}
          <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Alfajer was founded with a simple yet powerful mission: to bring authentic, premium quality organic products directly to your home. We believe in the power of nature and the importance of maintaining traditional methods while embracing modern convenience.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                With years of experience sourcing the finest dry fruits, spices, and specialty products from around the world, we've built a reputation for excellence, quality, and customer satisfaction that spans continents.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-[#009744]/10 to-[#009744]/5 border border-[#009744]/20 rounded-2xl h-96 flex items-center justify-center"
            >
              <div className="text-center">
                <Heart className="w-24 h-24 text-[#009744] mx-auto mb-4" />
                <p className="text-gray-700 font-bold text-xl">Premium Quality Since Day One</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Our Values */}
          <motion.div variants={itemVariants}>
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">The principles that guide everything we do</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Award, title: "Quality", description: "Finest products meeting strict standards" },
                { icon: Globe, title: "Authenticity", description: "100% genuine from verified suppliers" },
                { icon: Heart, title: "Trust", description: "Transparent and honest dealings always" },
                { icon: Truck, title: "Reliability", description: "Fast delivery with great service" },
              ].map((value, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-[#009744]/30 transition-all text-center"
                >
                  <value.icon className="h-12 w-12 text-[#009744] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Why Choose Us */}
          <div className="bg-gray-50 py-12 lg:py-16">
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose Alfajer?</h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">Experience the difference of premium quality and exceptional service</p>
              </div>
              <div className="max-w-4xl mx-auto space-y-4">
                {[
                  { icon: Leaf, title: "Direct Sourcing", description: "We source directly from premium farms and suppliers worldwide" },
                  { icon: Zap, title: "Quality Control", description: "Rigorous inspection at every step to ensure freshness and authenticity" },
                  { icon: Award, title: "Certified Products", description: "100% authentic with certificates of authenticity included" },
                  { icon: Truck, title: "Fast Delivery", description: "Reliable shipping to your doorstep with real-time tracking" },
                  { icon: Heart, title: "24/7 Support", description: "Expert customer support available whenever you need help" },
                  { icon: Globe, title: "Sustainable", description: "Eco-friendly packaging and commitment to sustainable practices" },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      className="bg-white border border-gray-200 rounded-lg p-6 flex items-start gap-4 hover:shadow-md transition-shadow"
                    >
                      <Icon className="h-6 w-6 text-[#009744] flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-[#009744] via-[#00a852] to-[#006b2f] rounded-2xl p-8 lg:p-12 text-white text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Experience Premium Quality?</h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">Join thousands of satisfied customers who trust Alfajer for their premium organic products</p>
              <Link
                href="/shop"
                className="inline-block bg-white text-[#009744] hover:bg-gray-100 font-bold py-3 px-10 rounded-lg transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
