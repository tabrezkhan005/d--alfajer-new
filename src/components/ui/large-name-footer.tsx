"use client";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";

import { Icons } from "@/src/components/ui/icons";
import { Button } from "@/src/components/ui/button";
import { useI18n } from "@/src/components/providers/i18n-provider";

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 overflow-x-hidden">
      <div className="container mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 md:py-8 lg:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-6 lg:gap-8 xl:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 md:col-span-1 space-y-2 sm:space-y-3">
            <Link href="/" className="inline-block">
              <Image
                src="/images/alfajernewlogo.jpeg"
                alt="Al Fajer Mart"
                width={80}
                height={26}
                className="object-contain"
                priority
              />
            </Link>
            <p className="text-xs sm:text-sm md:text-sm text-gray-600 leading-relaxed max-w-md">
              {t('footer.tagline')}
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
            <h3 className="text-xs sm:text-sm md:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 sm:mb-3">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-xs sm:text-sm md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blogs"
                  className="text-xs sm:text-sm md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  Blogs
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-xs sm:text-sm md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  {t('footer.products')}
                </Link>
              </li>
              <li>
                <Link
                  href="/collections"
                  className="text-xs sm:text-sm md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  {t('footer.collections')}
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-xs sm:text-sm md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  {t('footer.shop')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-xs sm:text-sm md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  {t('footer.contactUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-xs sm:text-sm md:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 sm:mb-3">
              {t('footer.customerService')}
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link
                  href="/returns"
                  className="text-xs sm:text-sm md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  {t('footer.returnRefunds')}
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-xs sm:text-sm md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  {t('footer.shippingPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-xs sm:text-sm md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  {t('footer.faqs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-xs sm:text-sm md:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 sm:mb-3">
              {t('footer.contactInfo')}
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li className="flex items-start gap-1.5 sm:gap-2">
                <MapPin className="h-3 sm:h-4 md:h-5 w-3 sm:w-4 md:w-5 text-[#009744] mt-0.5 shrink-0" />
                <span className="text-xs sm:text-sm md:text-sm text-gray-600">{t('footer.location')}</span>
              </li>
              <li className="flex items-center gap-1.5 sm:gap-2">
                <Phone className="h-3 sm:h-4 md:h-5 w-3 sm:w-4 md:w-5 text-[#009744] shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="text-xs sm:text-sm md:text-sm text-gray-600 hover:text-[#009744] transition-colors"
                >
                  {t('footer.phone_text')}
                </a>
              </li>
              <li className="flex items-center gap-1.5 sm:gap-2">
                <Mail className="h-3 sm:h-4 md:h-5 w-3 sm:w-4 md:w-5 text-[#009744] shrink-0" />
                <a
                  href="mailto:info@alfajermart.com"
                  className="text-xs sm:text-sm md:text-sm text-gray-600 hover:text-[#009744] transition-colors break-all"
                >
                  {t('footer.email_text')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Large Brand Text */}
        <div className="mt-4 sm:mt-6 md:mt-8 lg:mt-10 pt-4 sm:pt-6 md:pt-8 lg:pt-10 border-t border-gray-200">
          <div className="flex items-center justify-center px-2 pb-6 sm:pb-7 md:pb-8 lg:pb-10 xl:pb-12">
            <h1
              className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold select-none font-secondary tracking-tight leading-[1.15] text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(to bottom, #009744, #099042, #128A40, #1C833F, #257D3D, #2E763B)'
              }}
            >
              {t('footer.brand')}.
            </h1>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-4 sm:mt-6 md:mt-8 lg:mt-10 pt-3 sm:pt-4 md:pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 md:gap-4 px-2">
            <p className="text-xs sm:text-sm md:text-sm lg:text-sm text-gray-600 text-center sm:text-left">
              {t('footer.copyright')}
            </p>
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
              <Link
                href="/privacy"
                className="text-xs sm:text-sm md:text-sm lg:text-sm text-gray-600 hover:text-[#009744] transition-colors whitespace-nowrap"
              >
                {t('footer.privacy')}
              </Link>
              <Link
                href="/terms"
                className="text-xs sm:text-sm md:text-sm lg:text-sm text-gray-600 hover:text-[#009744] transition-colors whitespace-nowrap"
              >
                {t('footer.termsOfService')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
