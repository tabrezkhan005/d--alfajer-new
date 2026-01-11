"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Newsletter } from "@/src/components/newsletter/Newsletter";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function PrivacyPage() {
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
            <span className="text-gray-900 font-medium">Privacy Policy</span>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-lg text-white/90">We respect your privacy and protect your data</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <motion.div initial="hidden" animate="visible" className="space-y-8">
          {[
            {
              title: "1. Introduction",
              content:
                "Alfajer ('we', 'us', 'our', or 'Company') operates the website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.",
            },
            {
              title: "2. Information Collection and Use",
              content:
                "We collect several different types of information for various purposes to provide and improve our Service to you.",
              items: [
                "Personal Data: Email address, name, phone number, address",
                "Usage Data: Browser type, IP address, pages visited, time spent",
                "Cookies: Tracking pixels and similar technologies",
              ],
            },
            {
              title: "3. Use of Data",
              content: "Alfajer uses the collected data for various purposes:",
              items: [
                "To provide and maintain our Service",
                "To notify you about changes to our Service",
                "To allow you to participate in interactive features of our Service",
                "To provide customer support",
                "To gather analysis or valuable information to improve our Service",
                "To monitor the usage of our Service",
                "To detect, prevent and address technical and security issues",
              ],
            },
            {
              title: "4. Security of Data",
              content:
                "The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.",
            },
            {
              title: "5. Service Providers",
              content:
                "We may employ third party companies and individuals to facilitate our Service, provide the Service on our behalf, perform Service-related services or assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.",
            },
            {
              title: "6. Links to Other Sites",
              content:
                "Our Service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.",
            },
            {
              title: "7. Children's Privacy",
              content:
                "Our Service does not address anyone under the age of 18 ('Children'). We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us immediately.",
            },
            {
              title: "8. Changes to This Privacy Policy",
              content:
                "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'effective date' at the top of this Privacy Policy.",
            },
            {
              title: "9. Contact Us",
              content:
                "If you have any questions about this Privacy Policy, please contact us at support@alfajer.com or through our contact page.",
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
