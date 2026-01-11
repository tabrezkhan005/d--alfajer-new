"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Award, Globe, Truck } from "lucide-react";
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

export default function AboutPage() {
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
            <span className="text-gray-900 font-medium">About Us</span>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Alfajer</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Discover our story and commitment to bringing you the finest premium organic products
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          {/* Our Story */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Alfajer was founded with a simple yet powerful mission: to bring authentic, premium quality organic products directly to your home. We believe in the power of nature and the importance of maintaining traditional methods while embracing modern convenience.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                With years of experience in sourcing the finest dry fruits and spices from around the world, we've built a reputation for excellence, quality, and customer satisfaction that spans continents.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#009744]/10 to-[#009744]/5 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <Heart className="w-24 h-24 text-[#009744] mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">Premium Quality Since Day One</p>
              </div>
            </div>
          </motion.div>

          {/* Our Values */}
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  icon: Award,
                  title: "Quality",
                  description: "We source only the finest, premium products that meet our strict quality standards",
                },
                {
                  icon: Globe,
                  title: "Authenticity",
                  description: "100% genuine products from verified suppliers around the world",
                },
                {
                  icon: Heart,
                  title: "Trust",
                  description: "Built on transparency and honest dealings with our valued customers",
                },
                {
                  icon: Truck,
                  title: "Reliability",
                  description: "Fast, secure delivery with exceptional customer service every time",
                },
              ].map((value, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-gray-50 p-8 rounded-lg text-center hover:shadow-lg transition-shadow"
                >
                  <value.icon className="w-12 h-12 text-[#009744] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Why Choose Us */}
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Why Choose Alfajer?</h2>
            <div className="bg-gradient-to-br from-[#009744]/5 to-[#009744]/10 rounded-lg p-8 md:p-12">
              <ul className="space-y-4">
                {[
                  "Direct sourcing from premium farms and suppliers worldwide",
                  "Rigorous quality control at every step",
                  "100% authentic products with certificates of authenticity",
                  "Fast and reliable delivery to your doorstep",
                  "Expert customer support available 24/7",
                  "Competitive prices without compromising on quality",
                  "Eco-friendly packaging and sustainable practices",
                ].map((item, idx) => (
                  <motion.li
                    key={idx}
                    variants={itemVariants}
                    className="flex items-start gap-3 text-lg text-gray-700"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#009744] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
