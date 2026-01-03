"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { Separator } from "@/src/components/ui/separator";
import { useAnnouncementBar } from "./useAnnouncementBar";
import { CurrencySelector } from "./CurrencySelector";
import { LanguageSelector } from "./LanguageSelector";

interface AnnouncementBarProps {
  messages?: string[];
  defaultCurrency?: string;
  defaultLanguage?: string;
}

const defaultMessages = [
  "Free shipping on orders above ₹999",
  "Premium quality dry fruits & spices",
  "Delivering worldwide",
  "100% authentic products guaranteed",
];

export const AnnouncementBar = ({
  messages = defaultMessages,
  defaultCurrency,
  defaultLanguage,
}: AnnouncementBarProps) => {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const {
    isVisible,
    currentMessage,
    currency,
    language,
    setCurrency,
    setLanguage,
    currentMessageIndex,
  } = useAnnouncementBar({
    messages,
    defaultCurrency,
    defaultLanguage,
  });

  // Don't show on admin pages
  const isAdminPage = pathname?.startsWith("/admin");

  // Initial animation on mount
  useEffect(() => {
    if (!isVisible || !barRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(barRef.current, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      barRef.current,
      { y: "-100%", opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
      }
    );
  }, [isVisible]);

  // Message rotation animation
  useEffect(() => {
    if (!isVisible || !messageRef.current || messages.length <= 1) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    gsap.fromTo(
      messageRef.current,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      }
    );
  }, [currentMessageIndex, isVisible, messages.length]);


  // Update body padding when bar is visible
  useEffect(() => {
    if (!isVisible || isAdminPage) {
      document.body.style.paddingTop = "0px";
      return;
    }

    document.body.style.paddingTop = "36px";
    return () => {
      document.body.style.paddingTop = "0px";
    };
  }, [isVisible, isAdminPage]);

  if (!isVisible || isAdminPage) {
    return null;
  }

    return (
      <div
        ref={barRef}
        className="fixed top-0 left-0 right-0 z-50 h-9"
        style={{
          backgroundColor: "#2E763B",
          color: "#FEFEFE",
          transform: "translateY(-100%)",
        }}
        role="banner"
        aria-label="Announcement"
      >
        <div className="mx-auto flex h-full max-w-[1920px] items-center justify-center px-4 sm:px-6 lg:px-8">
          {/* Message Section - Centered */}
          <div className="flex flex-1 items-center justify-center">
            <div
              ref={messageRef}
              className="flex items-center gap-2 text-center text-xs font-medium sm:text-sm font-body"
              key={currentMessageIndex}
            >
              <span className="hidden sm:inline" aria-hidden="true">
                📢
              </span>
              <span>{currentMessage}</span>
            </div>
          </div>

          {/* Controls Section */}
          <div className="absolute right-4 flex items-center gap-1 sm:right-6 lg:right-8">
            <div className="flex items-center gap-1">
              <LanguageSelector
                language={language}
                onLanguageChange={setLanguage}
              />
              <Separator orientation="vertical" className="hidden h-4 bg-[#FEFEFE]/20 sm:block" />
              <CurrencySelector
                currency={currency}
                onCurrencyChange={setCurrency}
              />
            </div>
          </div>
        </div>
      </div>
    );
};
