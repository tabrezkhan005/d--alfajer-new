"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { Language, Currency, LANGUAGES, CURRENCIES, t, formatCurrency, convertCurrency } from '@/src/lib/i18n';
import {
  detectUserGeolocation,
  cacheGeolocationData,
  getCachedGeolocationData,
} from '@/src/lib/geolocation';

interface I18nContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  convertCurrency: (amount: number, fromCurrency?: Currency) => number;
  direction: 'ltr' | 'rtl';
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY_LANG = 'al-fajr-language';
const STORAGE_KEY_CURR = 'al-fajr-currency';

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [currency, setCurrencyState] = useState<Currency>('INR');
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage and geolocation
  useEffect(() => {
    let isMounted = true;

    const initializeI18n = async () => {
      try {
        // Check if user has custom preferences saved
        const storedLang = localStorage.getItem(STORAGE_KEY_LANG) as Language | null;
        const storedCurr = localStorage.getItem(STORAGE_KEY_CURR) as Currency | null;

        if (storedLang && storedCurr) {
          // Use stored preferences
          if (isMounted) {
            setLanguageState(storedLang);
            setCurrencyState(storedCurr);
            setIsHydrated(true);
            setIsLoading(false);
          }
          return;
        }

        // Try cached geolocation data
        const cachedGeo = getCachedGeolocationData();
        if (cachedGeo && isMounted) {
          const detectedLang = (cachedGeo.language.toLowerCase() as Language) || 'en';
          const detectedCurr = (cachedGeo.currency.toUpperCase() as Currency) || 'INR';
          
          setLanguageState(detectedLang);
          setCurrencyState(detectedCurr);
          setIsHydrated(true);
          setIsLoading(false);
          return;
        }

        // Detect geolocation
        const geoData = await detectUserGeolocation();

        if (isMounted) {
          const detectedLang = (geoData.language.toLowerCase() as Language) || 'en';
          const detectedCurr = (geoData.currency.toUpperCase() as Currency) || 'INR';

          setLanguageState(detectedLang);
          setCurrencyState(detectedCurr);

          // Cache the geolocation data
          cacheGeolocationData(geoData);

          setIsHydrated(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.debug('I18n initialization error:', error);
        if (isMounted) {
          setIsHydrated(true);
          setIsLoading(false);
        }
      }
    };

    initializeI18n();

    return () => {
      isMounted = false;
    };
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY_LANG, lang);
    // Update cached geolocation
    const cached = getCachedGeolocationData();
    if (cached) {
      cacheGeolocationData({
        ...cached,
        language: lang,
      });
    }
  }, []);

  const setCurrency = useCallback((curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem(STORAGE_KEY_CURR, curr);
    // Update cached geolocation
    const cached = getCachedGeolocationData();
    if (cached) {
      cacheGeolocationData({
        ...cached,
        currency: curr,
      });
    }
  }, []);

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const value: I18nContextType = {
    language,
    currency,
    setLanguage,
    setCurrency,
    t: (key: string) => t(key, language),
    formatCurrency: (amount: number) => formatCurrency(amount, currency),
    convertCurrency: (amount: number, fromCurrency: Currency = 'INR') =>
      convertCurrency(amount, fromCurrency, currency),
    direction,
    isLoading,
  };

  if (!isHydrated) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
