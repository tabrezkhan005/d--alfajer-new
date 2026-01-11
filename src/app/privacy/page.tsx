"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Lock, Eye } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";

export default function PrivacyPage() {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const sections = [
    {
      title: "1. Introduction",
      content: "Alfajer ('we', 'us', 'our', or 'Company') operates the website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.",
    },
    {
      title: "2. Information Collection and Use",
      content: "We collect several different types of information for various purposes to provide and improve our Service to you.",
      items: ["Personal Data: Email, name, phone, address", "Usage Data: Browser type, IP address, pages visited", "Cookies: Tracking and analytics technologies"],
    },
    {
      title: "3. Use of Data",
      content: "Alfajer uses the collected data for various purposes:",
      items: ["To provide and maintain our Service", "To notify you about changes", "To provide customer support", "To improve our Service", "To detect security issues"],
    },
    {
      title: "4. Security of Data",
      content: "The security of your data is important to us. We strive to use commercially acceptable means to protect your Personal Data using industry-standard encryption and security protocols.",
    },
    {
      title: "5. Service Providers",
      content: "We may employ third party companies to facilitate our Service. These third parties have access to your data only to perform tasks on our behalf and are obligated not to disclose or use it for any other purpose.",
    },
    {
      title: "6. Links to Other Sites",
      content: "Our Service may contain links to other sites. We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.",
    },
    {
      title: "7. Children's Privacy",
      content: "Our Service does not address anyone under 18. We do not knowingly collect personal information from children. If you are aware your child has provided us data, please contact us immediately.",
    },
    {
      title: "8. Changes to This Policy",
      content: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the effective date.",
    },
    {
      title: "9. Contact Us",
      content: "If you have any questions about this Privacy Policy, please contact us at support@alfajer.com or through our contact page.",
    },
  ];

  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors font-medium">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">Privacy Policy</span>
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
              <Shield className="h-8 w-8" />
              <span className="text-sm font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">Your Privacy Matters</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Privacy Policy
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              We are committed to protecting your personal information and your right to privacy.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-6 sm:gap-8"
        >
          {[
            { icon: Shield, title: "Data Protection", desc: "Your data is encrypted and secure" },
            { icon: Lock, title: "Privacy First", desc: "We never share your personal information" },
            { icon: Eye, title: "Transparency", desc: "Clear policies about what we collect" }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg transition-all text-center"
            >
              <feature.icon className="h-12 w-12 text-[#009744] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-[#009744]">•</span>
                {section.title}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">{section.content}</p>
              {section.items && (
                <ul className="space-y-2 ml-4">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                      <span className="text-[#009744] font-bold mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
