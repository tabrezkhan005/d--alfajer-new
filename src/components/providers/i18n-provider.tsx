"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { Language, Currency, LANGUAGES, CURRENCIES, t, formatCurrency, convertCurrency } from '@/src/lib/i18n';

interface I18nContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  convertCurrency: (amount: number, fromCurrency?: Currency) => number;
  direction: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY_LANG = 'al-fajr-language';
const STORAGE_KEY_CURR = 'al-fajr-currency';

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [currency, setCurrencyState] = useState<Currency>('INR');
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize from localStorage and detect locale
  useEffect(() => {
    const storedLang = localStorage.getItem(STORAGE_KEY_LANG) as Language | null;
    const storedCurr = localStorage.getItem(STORAGE_KEY_CURR) as Currency | null;

    if (storedLang && Object.keys(LANGUAGES).includes(storedLang)) {
      setLanguageState(storedLang);
    }
    if (storedCurr && Object.keys(CURRENCIES).includes(storedCurr)) {
      setCurrencyState(storedCurr);
    }

    // Auto-detect currency and language from browser locale
    if (!storedCurr || !storedLang) {
      const locale = navigator.language || 'en-US';
      
      const currencyMap: Record<string, Currency> = {
        'en-IN': 'INR',
        'hi-IN': 'INR',
        'ar-AE': 'AED',
        'ar-SA': 'AED',
        'en-AE': 'AED',
        'en-US': 'USD',
        'en-GB': 'GBP',
        'fr-FR': 'EUR',
        'de-DE': 'EUR',
        'es-ES': 'EUR',
      };
      
      const langMap: Record<string, Language> = {
        'ar': 'ar',
        'hi': 'hi',
        'en': 'en',
      };

      if (!storedCurr) {
        const detectedCurr = currencyMap[locale] || 'INR';
        setCurrencyState(detectedCurr);
      }
      
      if (!storedLang) {
        const langCode = locale.split('-')[0];
        const detectedLang = langMap[langCode] || 'en';
        setLanguageState(detectedLang as Language);
      }
    }

    setIsHydrated(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  }, []);

  const setCurrency = useCallback((curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem(STORAGE_KEY_CURR, curr);
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
