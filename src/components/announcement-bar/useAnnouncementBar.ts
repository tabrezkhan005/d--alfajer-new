"use client";

import { useState, useEffect } from "react";
import {
  detectUserGeolocation,
  cacheGeolocationData,
  getCachedGeolocationData,
} from "@/src/lib/geolocation";

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
  const [isLoading, setIsLoading] = useState(true);

  // Always show the bar (no dismiss functionality)
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Auto-detect currency and language from geolocation
  useEffect(() => {
    let isMounted = true;

    const initializeGeolocation = async () => {
      try {
        // Try to get cached data first
        const cachedData = getCachedGeolocationData();
        if (cachedData && isMounted) {
          setCurrency(cachedData.currency);
          setLanguage(cachedData.language);
          setIsLoading(false);
          return;
        }

        // Detect geolocation
        const geoData = await detectUserGeolocation();

        if (isMounted) {
          setCurrency(geoData.currency);
          setLanguage(geoData.language);
          // Cache the data
          cacheGeolocationData(geoData);
          setIsLoading(false);
        }
      } catch (error) {
        console.debug("Geolocation detection failed, using defaults:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeGeolocation();

    return () => {
      isMounted = false;
    };
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

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    // Persist to localStorage
    if (typeof window !== "undefined") {
      const cached = getCachedGeolocationData();
      if (cached) {
        cacheGeolocationData({
          ...cached,
          currency: newCurrency,
        });
      }
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // Persist to localStorage
    if (typeof window !== "undefined") {
      const cached = getCachedGeolocationData();
      if (cached) {
        cacheGeolocationData({
          ...cached,
          language: newLanguage,
        });
      }
    }
  };

  return {
    isVisible,
    currentMessage,
    currency,
    language,
    setCurrency: handleCurrencyChange,
    setLanguage: handleLanguageChange,
    currentMessageIndex,
    isLoading,
  };
};
