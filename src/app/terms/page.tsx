"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, CheckCircle } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";

export default function TermsPage() {
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
            <span className="text-gray-900 font-semibold">Terms & Conditions</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#009744] via-[#00a852] to-[#006b2f] text-white relative overflow-hidden pt-20 sm:pt-24 md:pt-28 lg:pt-32">
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
              <FileText className="h-8 w-8" />
              <span className="text-sm font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">Legal Terms</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Terms & Conditions
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              Please read our terms carefully before using our website and services.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              {
                title: "1. Agreement to Terms",
                content: "By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
              },
              {
                title: "2. Use License",
                content: "Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial viewing. Under this license you may not:",
                items: ["Modify or copy the materials", "Use materials for commercial purposes", "Attempt to reverse engineer software", "Remove copyright or proprietary notations"]
              },
              {
                title: "3. Disclaimer",
                content: "The materials on our website are provided 'as is'. We make no warranties, expressed or implied, and disclaim all warranties including merchantability, fitness for a particular purpose, or non-infringement of intellectual property."
              },
              {
                title: "4. Limitations of Liability",
                content: "In no event shall Alfajer be liable for any damages arising from use or inability to use the materials on our website, including loss of data, profit, or business interruption."
              },
              {
                title: "5. Accuracy of Materials",
                content: "The materials on our website may include technical, typographical, or photographic errors. We do not warrant accuracy or completeness and may change materials at any time without notice."
              },
              {
                title: "6. External Links",
                content: "We are not responsible for the contents of linked websites. Inclusion of a link does not imply endorsement. Use of linked websites is at your own risk."
              },
              {
                title: "7. Modifications to Terms",
                content: "We may revise these terms at any time without notice. Your continued use of the website constitutes your acceptance of the revised terms."
              },
              {
                title: "8. Product Information",
                content: "We strive for accurate product descriptions and pricing. If a product is not as described, your sole remedy is to return it in unused condition for a full refund."
              },
              {
                title: "9. Payment Terms",
                content: "All orders must be paid in full before processing. We accept various payment methods as indicated during checkout. Payment must be received before shipment."
              },
              {
                title: "10. Governing Law",
                content: "These terms are governed by the laws of the United Arab Emirates. You agree to submit to the exclusive jurisdiction of courts in that location for any disputes."
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

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
