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

    // Mobile: 32px (h-8), Tablet/Desktop: 36px (h-9)
    const paddingTop = window.innerWidth < 640 ? "32px" : "36px";
    document.body.style.paddingTop = paddingTop;
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
        className="fixed top-0 left-0 right-0 z-30 h-8 sm:h-9 w-full overflow-x-hidden"
        style={{
          backgroundColor: "#2E763B",
          color: "#FEFEFE",
          transform: "translateY(-100%)",
        }}
        role="banner"
        aria-label="Announcement"
      >
        <div className="mx-auto flex h-full w-full max-w-[1920px] items-center justify-center px-2 sm:px-3 md:px-4 lg:px-8">
          {/* Message Section - Centered */}
          <div className="flex flex-1 items-center justify-center min-w-0 max-w-[calc(100%-80px)] sm:max-w-none pr-2 sm:pr-0">
            <div
              ref={messageRef}
              className="flex items-center gap-1 sm:gap-2 text-center text-[10px] sm:text-xs md:text-sm font-medium font-body whitespace-nowrap sm:whitespace-normal overflow-hidden text-ellipsis"
              key={currentMessageIndex}
            >
              <span className="hidden sm:inline text-lg" aria-hidden="true">
                📢
              </span>
              <span>{currentMessage}</span>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex items-center gap-0.5 sm:gap-1 ml-auto flex-shrink-0">
            <div className="flex items-center gap-0.5 sm:gap-1">
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
