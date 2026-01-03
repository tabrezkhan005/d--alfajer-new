"use client";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";

import { Icons } from "@/src/components/ui/icons";
import { Button } from "@/src/components/ui/button";

function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 overflow-x-hidden">
      <div className="container mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-6 sm:py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-6 lg:gap-8 xl:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 md:col-span-1 space-y-2 sm:space-y-3">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo/nifajer-logo.png"
                alt="Al Fajer Mart"
                width={80}
                height={26}
                className="object-contain"
                priority
              />
            </Link>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 leading-relaxed max-w-md">
              Your trusted source for premium organic products and natural goods.
              Quality you can trust, delivered fresh to your door.
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2 pt-1.5 sm:pt-2">
              <a
                href="https://facebook.com"
                className="h-7 sm:h-8 md:h-9 lg:h-10 w-7 sm:w-8 md:w-9 lg:w-10 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:border-[#009744] hover:bg-[#009744]/5 transition-all"
                aria-label="Facebook"
              >
                <Facebook className="h-3 sm:h-4 md:h-5 w-3 sm:w-4 md:w-5 text-gray-600 hover:text-[#009744] transition-colors" />
              </a>
              <a
                href="https://instagram.com"
                className="h-7 sm:h-8 md:h-9 lg:h-10 w-7 sm:w-8 md:w-9 lg:w-10 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:border-[#009744] hover:bg-[#009744]/5 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="h-3 sm:h-4 md:h-5 w-3 sm:w-4 md:w-5 text-gray-600 hover:text-[#009744] transition-colors" />
              </a>
              <a
                href="https://x.com"
                className="h-7 sm:h-8 md:h-9 lg:h-10 w-7 sm:w-8 md:w-9 lg:w-10 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:border-[#009744] hover:bg-[#009744]/5 transition-all"
                aria-label="Twitter"
              >
                <Twitter className="h-3 sm:h-4 md:h-5 w-3 sm:w-4 md:w-5 text-gray-600 hover:text-[#009744] transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 sm:mb-3">
              Quick Links
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-[9px] sm:text-xs md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/collections"
                  className="text-[9px] sm:text-xs md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-[9px] sm:text-xs md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-[9px] sm:text-xs md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[9px] sm:text-xs md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 sm:mb-3">
              Customer Service
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-[9px] sm:text-xs md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-[9px] sm:text-xs md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-[9px] sm:text-xs md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-[9px] sm:text-xs md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 sm:mb-3">
              Contact Us
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li className="flex items-start gap-1.5 sm:gap-2">
                <MapPin className="h-3 sm:h-4 md:h-5 w-3 sm:w-4 md:w-5 text-[#009744] mt-0.5 shrink-0" />
                <span className="text-[9px] sm:text-xs md:text-sm text-gray-600">Mumbai, India</span>
              </li>
              <li className="flex items-center gap-1.5 sm:gap-2">
                <Phone className="h-3 sm:h-4 md:h-5 w-3 sm:w-4 md:w-5 text-[#009744] shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="text-[9px] sm:text-xs md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-1.5 sm:gap-2">
                <Mail className="h-3 sm:h-4 md:h-5 w-3 sm:w-4 md:w-5 text-[#009744] shrink-0" />
                <a
                  href="mailto:info@alfajermart.com"
                  className="text-[9px] sm:text-xs md:text-sm text-gray-600 hover:text-[#009744] transition-colors break-all"
                >
                  info@alfajermart.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Large Brand Text */}
        <div className="mt-6 sm:mt-8 md:mt-12 lg:mt-16 pt-6 sm:pt-8 md:pt-10 lg:pt-12 border-t border-gray-200">
          <div className="flex items-center justify-center px-2">
            <h1
              className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold select-none font-secondary tracking-tight leading-tight sm:leading-none bg-gradient-to-b from-[#009744] via-[#099042] via-[#128A40] via-[#1C833F] via-[#257D3D] to-[#2E763B] text-transparent bg-clip-text"
            >
              Al Fajer Mart.
            </h1>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 pt-4 sm:pt-6 md:pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 md:gap-4 px-2">
            <p className="text-[8px] sm:text-[9px] md:text-xs lg:text-sm text-gray-600 text-center sm:text-left">
              © {new Date().getFullYear()} Al Fajer Mart. All rights reserved.
            </p>
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
              <Link
                href="/privacy-policy"
                className="text-[8px] sm:text-[9px] md:text-xs lg:text-sm text-gray-600 hover:text-[#009744] transition-colors whitespace-nowrap"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-[8px] sm:text-[9px] md:text-xs lg:text-sm text-gray-600 hover:text-[#009744] transition-colors whitespace-nowrap"
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
