// Country code to currency mapping
export const countryToCurrency: Record<string, string> = {
  // Asia
  IN: "INR", // India
  PK: "PKR", // Pakistan
  BD: "BDT", // Bangladesh
  LK: "LKR", // Sri Lanka
  NP: "NPR", // Nepal
  AE: "AED", // UAE
  SA: "SAR", // Saudi Arabia
  QA: "QAR", // Qatar
  OM: "OMR", // Oman
  KW: "KWD", // Kuwait
  BH: "BHD", // Bahrain
  JO: "JOD", // Jordan
  LB: "LBP", // Lebanon
  EG: "EGP", // Egypt
  TR: "TRY", // Turkey
  IR: "IRR", // Iran
  CN: "CNY", // China
  JP: "JPY", // Japan
  SG: "SGD", // Singapore
  MY: "MYR", // Malaysia
  TH: "THB", // Thailand
  ID: "IDR", // Indonesia
  PH: "PHP", // Philippines
  VN: "VND", // Vietnam
  KR: "KRW", // South Korea

  // Europe
  GB: "GBP", // United Kingdom
  DE: "EUR", // Germany
  FR: "EUR", // France
  IT: "EUR", // Italy
  ES: "EUR", // Spain
  NL: "EUR", // Netherlands
  BE: "EUR", // Belgium
  AT: "EUR", // Austria
  CH: "CHF", // Switzerland
  SE: "SEK", // Sweden
  NO: "NOK", // Norway
  DK: "DKK", // Denmark
  PL: "PLN", // Poland
  CZ: "CZK", // Czech Republic
  RU: "RUB", // Russia

  // Americas
  US: "USD", // United States
  CA: "CAD", // Canada
  MX: "MXN", // Mexico
  BR: "BRL", // Brazil
  AR: "ARS", // Argentina
  CL: "CLP", // Chile
  CO: "COP", // Colombia
  PE: "PEN", // Peru

  // Africa
  ZA: "ZAR", // South Africa
  NG: "NGN", // Nigeria
  KE: "KES", // Kenya

  // Oceania
  AU: "AUD", // Australia
  NZ: "NZD", // New Zealand
};

// Country code to language mapping
export const countryToLanguage: Record<string, string> = {
  // English-speaking countries
  US: "en",
  GB: "en",
  CA: "en",
  AU: "en",
  NZ: "en",
  IE: "en",
  ZA: "en",
  IN: "en", // English is widely spoken
  SG: "en",

  // Hindi-speaking countries
  NP: "hi", // Close to Hindi
  BD: "hi", // Close to Hindi

  // Arabic-speaking countries
  AE: "ar",
  SA: "ar",
  QA: "ar",
  OM: "ar",
  KW: "ar",
  BH: "ar",
  JO: "ar",
  LB: "ar",
  EG: "ar",
  TR: "en", // Turkey uses English widely
  IR: "en",

  // European countries
  DE: "en", // English widely spoken
  FR: "en",
  IT: "en",
  ES: "en",
  NL: "en",
  SE: "en",
  NO: "en",
  DK: "en",
  CH: "en",
  PL: "en",
  CZ: "en",

  // Asian countries
  CN: "en",
  JP: "en",
  KR: "en",
  MY: "en",
  TH: "en",
  ID: "en",
  PH: "en",
  VN: "en",
  PK: "en",
  LK: "en",

  // Americas
  MX: "en",
  BR: "en",
  AR: "en",
  CL: "en",

  // Default fallback
  DEFAULT: "en",
};

export interface GeolocationData {
  country: string;
  currency: string;
  language: string;
  timezone?: string;
}

/**
 * Get user's geolocation data using multiple methods
 * 1. Browser Geolocation API (requires user permission)
 * 2. IP-based geolocation (free services)
 * 3. Browser language preferences (fallback)
 */
export async function detectUserGeolocation(): Promise<GeolocationData> {
  try {
    // Try IP-based geolocation first (no permission needed)
    const geoData = await getIPBasedGeolocation();
    if (geoData) {
      return geoData;
    }
  } catch (error) {
    console.debug("IP-based geolocation failed:", error);
  }

  // Fallback to browser language detection
  return getBrowserLanguageGeolocation();
}

/**
 * Get geolocation from IP address using free service
 */
async function getIPBasedGeolocation(): Promise<GeolocationData | null> {
  try {
    // Using free IP geolocation API (ip-api.com)
    const response = await fetch("https://ip-api.com/json/?fields=countryCode,timezone", {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Geolocation API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "fail") {
      throw new Error(data.message || "Failed to get geolocation");
    }

    const countryCode = data.countryCode as string;
    const currency = countryToCurrency[countryCode] || "USD";
    const language = countryToLanguage[countryCode] || "EN";
    const timezone = data.timezone || undefined;

    return { country: countryCode, currency, language, timezone };
  } catch (error) {
    console.debug("IP-based geolocation error:", error);
    return null;
  }
}

/**
 * Detect geolocation from browser language and timezone
 */
function getBrowserLanguageGeolocation(): GeolocationData {
  if (typeof navigator === "undefined") {
    return {
      country: "US",
      currency: "USD",
      language: "en",
    };
  }

  // Get browser language
  const browserLang = (navigator.language || "en-US").toLowerCase();
  const [langCode, countryCode] = browserLang.split("-");

  // Map browser language to our language codes
  const languageMap: Record<string, string> = {
    ar: "ar",
    hi: "hi",
    en: "en",
    default: "en",
  };

  // Try country-specific first, then fallback to language
  let detectedLanguage = "en";
  let detectedCurrency = "USD";

  if (countryCode) {
    const upperCountryCode = countryCode.toUpperCase();
    detectedLanguage = countryToLanguage[upperCountryCode] || languageMap[langCode] || "en";
    detectedCurrency = countryToCurrency[upperCountryCode] || "USD";
  } else {
    detectedLanguage = languageMap[langCode] || "en";
  }

  return {
    country: countryCode?.toUpperCase() || "US",
    currency: detectedCurrency,
    language: detectedLanguage,
  };
}

/**
 * Cache the geolocation data in localStorage
 */
export function cacheGeolocationData(data: GeolocationData): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        "user_geolocation",
        JSON.stringify({
          ...data,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.debug("Failed to cache geolocation:", error);
    }
  }
}

/**
 * Get cached geolocation data
 */
export function getCachedGeolocationData(): GeolocationData | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const cached = localStorage.getItem("user_geolocation");
    if (cached) {
      const data = JSON.parse(cached);
      // Cache valid for 24 hours
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        return {
          country: data.country,
          currency: data.currency,
          language: data.language,
          timezone: data.timezone,
        };
      }
    }
  } catch (error) {
    console.debug("Failed to retrieve cached geolocation:", error);
  }

  return null;
}
