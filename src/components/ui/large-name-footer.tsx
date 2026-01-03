"use client";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";

import { Icons } from "@/src/components/ui/icons";
import { Button } from "@/src/components/ui/button";

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo/nifajer-logo.png"
                alt="Al Fajer Mart"
                width={120}
                height={40}
                className="object-contain"
                priority
              />
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed max-w-md">
              Your trusted source for premium organic products and natural goods.
              Quality you can trust, delivered fresh to your door.
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                className="h-10 w-10 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:border-[#009744] hover:bg-[#009744]/5 transition-all"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-gray-600 hover:text-[#009744] transition-colors" />
              </a>
              <a
                href="https://instagram.com"
                className="h-10 w-10 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:border-[#009744] hover:bg-[#009744]/5 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-gray-600 hover:text-[#009744] transition-colors" />
              </a>
              <a
                href="https://x.com"
                className="h-10 w-10 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:border-[#009744] hover:bg-[#009744]/5 transition-all"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 text-gray-600 hover:text-[#009744] transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/collections"
                  className="text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Customer Service
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#009744] mt-0.5 shrink-0" />
                <span className="text-sm text-gray-600">Mumbai, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#009744] shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#009744] shrink-0" />
                <a
                  href="mailto:info@alfajermart.com"
                  className="text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  info@alfajermart.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Large Brand Text */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="flex items-center justify-center">
            <h1
              className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[10rem] font-bold select-none font-secondary tracking-tight leading-none bg-gradient-to-b from-[#009744] via-[#099042] via-[#128A40] via-[#1C833F] via-[#257D3D] to-[#2E763B] text-transparent bg-clip-text"
            >
              Al Fajer Mart.
            </h1>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 text-center md:text-left">
              © {new Date().getFullYear()} Al Fajer Mart. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy-policy"
                className="text-sm text-gray-600 hover:text-[#009744] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-600 hover:text-[#009744] transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
