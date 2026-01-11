"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";
import { Button } from "@/src/components/ui/button";
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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

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
            <span className="text-gray-900 font-medium">Contact Us</span>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Get in touch with our team. We're here to help and answer any questions you may have.
            </p>
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
          {/* Contact Info */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Mail,
                title: "Email",
                content: "support@alfajer.com",
                subtext: "Response within 24 hours",
              },
              {
                icon: Phone,
                title: "Phone",
                content: "+971 4 XXX XXXX",
                subtext: "Available 24/7",
              },
              {
                icon: MapPin,
                title: "Address",
                content: "Dubai, UAE",
                subtext: "International Shipping",
              },
              {
                icon: Clock,
                title: "Hours",
                content: "24/7 Support",
                subtext: "Always available online",
              },
            ].map((info, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-gradient-to-br from-[#009744]/5 to-[#009744]/10 p-6 rounded-lg text-center hover:shadow-lg transition-shadow"
              >
                <info.icon className="w-12 h-12 text-[#009744] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                <p className="text-gray-900 font-medium mb-1">{info.content}</p>
                <p className="text-sm text-gray-600">{info.subtext}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition resize-none"
                    placeholder="Your message..."
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#009744] hover:bg-[#007A37] text-white font-semibold py-3 rounded-lg transition"
                >
                  Send Message
                </Button>
                {submitted && (
                  <p className="text-green-600 text-sm font-medium">Message sent successfully!</p>
                )}
              </form>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">FAQ</h2>
              <div className="space-y-4">
                {[
                  {
                    q: "What is your delivery time?",
                    a: "We deliver within 3-5 business days across UAE and internationally.",
                  },
                  {
                    q: "Do you offer international shipping?",
                    a: "Yes, we ship to most countries worldwide with tracking.",
                  },
                  {
                    q: "What if I'm not satisfied?",
                    a: "We offer 30-day returns and 100% satisfaction guarantee.",
                  },
                  {
                    q: "Are your products organic?",
                    a: "Yes, all our products are 100% authentic and certified.",
                  },
                ].map((faq, idx) => (
                  <motion.div key={idx} variants={itemVariants} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-gray-600 text-sm">{faq.a}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
