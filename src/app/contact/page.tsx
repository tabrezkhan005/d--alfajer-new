"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, ArrowRight } from "lucide-react";
import { Newsletter } from "@/src/components/newsletter/Newsletter";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

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
            <span className="text-gray-900 font-semibold">Contact Us</span>
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
              <Mail className="h-8 w-8" />
              <span className="text-sm font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">Get in Touch</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              We'd Love to Hear From You
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              Have questions? Our dedicated team is here to help and will respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { icon: Mail, title: "Email", content: "support@alfajer.com", desc: "Response within 24h" },
            { icon: Phone, title: "Phone", content: "+971 4 XXX XXXX", desc: "Call us anytime" },
            { icon: MapPin, title: "Visit Us", content: "Dubai, UAE", desc: "International reach" },
            { icon: Clock, title: "Support", content: "24/7 Available", desc: "Always online" }
          ].map((info, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-[#009744]/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <info.icon className="h-10 w-10 text-[#009744]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
              <p className="text-gray-900 font-semibold mb-1">{info.content}</p>
              <p className="text-sm text-gray-500">{info.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Contact Form & FAQ */}
      <div className="bg-gray-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-8 lg:gap-12"
          >
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 lg:p-10 rounded-2xl border border-gray-200 shadow-sm"
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Send us a Message</h2>
              <p className="text-gray-600 mb-8">We'll get back to you within 24 hours</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition"
                    placeholder="How can we assist?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition resize-none"
                    placeholder="Your message..."
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#009744] hover:bg-[#007A37] text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" /> Send Message
                </Button>
                {submitted && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 text-sm font-semibold">
                    ✓ Message sent successfully! We'll be in touch soon.
                  </motion.p>
                )}
              </form>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Quick Answers</h2>
              <p className="text-gray-600 mb-8">Find answers to common questions</p>
              <div className="space-y-4">
                {[
                  { q: "What is your delivery time?", a: "We deliver within 3-5 business days across UAE and internationally." },
                  { q: "Do you offer international shipping?", a: "Yes, we ship worldwide with full tracking and insurance." },
                  { q: "What if I'm not satisfied?", a: "30-day money-back guarantee on all products." },
                  { q: "Are your products certified organic?", a: "Yes, 100% authentic and certified products only." },
                ].map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-lg border border-gray-200 hover:border-[#009744]/30 transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <ArrowRight className="h-5 w-5 text-[#009744] mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                      <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed ml-8">{faq.a}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
