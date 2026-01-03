"use client";

import { useState, useEffect } from "react";

interface UseAnnouncementBarProps {
  messages: string[];
  defaultCurrency?: string;
  defaultLanguage?: string;
}

export const useAnnouncementBar = ({
  messages,
  defaultCurrency = "USD",
  defaultLanguage = "EN",
}: UseAnnouncementBarProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currency, setCurrency] = useState(defaultCurrency);
  const [language, setLanguage] = useState(defaultLanguage);
  const [isVisible, setIsVisible] = useState(false);

  // Always show the bar (no dismiss functionality)
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Auto-detect currency and language
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Detect currency from locale
      const locale = navigator.language || "en-US";
      const currencyMap: Record<string, string> = {
        "en-IN": "INR",
        "hi-IN": "INR",
        "ar-AE": "AED",
        "ar-SA": "AED",
        "en-AE": "AED",
        "en-US": "USD",
        "en-GB": "GBP",
        "fr-FR": "EUR",
        "de-DE": "EUR",
        "es-ES": "EUR",
      };

      const detectedCurrency =
        currencyMap[locale] ||
        (locale.includes("IN") ? "INR" : locale.includes("AE") ? "AED" : "USD");
      setCurrency(detectedCurrency);

      // Detect language
      const langMap: Record<string, string> = {
        "ar": "AR",
        "hi": "HI",
        "en": "EN",
      };
      const detectedLang = langMap[locale.split("-")[0]] || "EN";
      setLanguage(detectedLang);
    }
  }, []);

  // Rotate messages
  useEffect(() => {
    if (!isVisible || messages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible, messages.length]);

  const currentMessage = messages[currentMessageIndex] || messages[0];

  return {
    isVisible,
    currentMessage,
    currency,
    language,
    setCurrency,
    setLanguage,
    currentMessageIndex,
  };
};
