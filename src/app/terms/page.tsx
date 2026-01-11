"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Newsletter } from "@/src/components/newsletter/Newsletter";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function TermsPage() {
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
            <span className="text-gray-900 font-medium">Terms & Conditions</span>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
            <p className="text-lg text-white/90">Last updated: January 2024</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <motion.div initial="hidden" animate="visible" className="space-y-8">
          {[
            {
              title: "1. Agreement to Terms",
              content:
                "By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.",
            },
            {
              title: "2. Use License",
              content:
                "Permission is granted to temporarily download one copy of the materials (information or software) on Alfajer's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:",
              items: [
                "Modify or copy the materials",
                "Use the materials for any commercial purpose or for any public display",
                "Attempt to reverse engineer any software contained on the website",
                "Remove any copyright or other proprietary notations from the materials",
              ],
            },
            {
              title: "3. Disclaimer",
              content:
                "The materials on Alfajer's website are provided on an 'as is' basis. Alfajer makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.",
            },
            {
              title: "4. Limitations",
              content:
                "In no event shall Alfajer or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Alfajer's website.",
            },
            {
              title: "5. Accuracy of Materials",
              content:
                "The materials appearing on Alfajer's website could include technical, typographical, or photographic errors. Alfajer does not warrant that any of the materials on its website are accurate, complete, or current. Alfajer may make changes to the materials contained on its website at any time without notice.",
            },
            {
              title: "6. Links",
              content:
                "Alfajer has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Alfajer of the site. Use of any such linked website is at the user's own risk.",
            },
            {
              title: "7. Modifications",
              content:
                "Alfajer may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.",
            },
            {
              title: "8. Product Information",
              content:
                "We strive to provide accurate product descriptions and pricing. However, Alfajer does not warrant that product descriptions, pricing, or other content is accurate, complete, reliable, current, or error-free. If a product offered by Alfajer is not as described, your sole remedy is to return it in unused condition.",
            },
            {
              title: "9. Payment Terms",
              content:
                "All orders must be paid in full before processing. We accept various payment methods as indicated during checkout. Payment must be received before shipment of your order.",
            },
            {
              title: "10. Governing Law",
              content:
                "These terms and conditions are governed by and construed in accordance with the laws of the United Arab Emirates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.",
            },
          ].map((section, idx) => (
            <motion.div key={idx} variants={itemVariants} className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-3">{section.content}</p>
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
        </motion.div>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
