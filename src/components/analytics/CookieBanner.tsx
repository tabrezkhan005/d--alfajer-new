"use client";

import { useState, useEffect } from "react";
import { getPublicStoreSetting } from "@/src/app/actions/settings";
import { Button } from "@/src/components/ui/button";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function initBanner() {
      // Check if user already consented/rejected
      const hasConsent = document.cookie.split('; ').find(row => row.startsWith('cookie_consent='));

      try {
        const storedSettings = await getPublicStoreSetting("cookie_banner_settings");

        if (!storedSettings || storedSettings.enabled === false) {
          // If disabled, default to accepted tracking for backwards compatibility without banner
          if (!hasConsent) {
             document.cookie = "cookie_consent=accepted; max-age=31536000; path=/";
             window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: 'accepted' }));
          }
          return;
        }

        if (hasConsent) {
          return; // Already decided
        }

        setSettings(storedSettings);
        setIsVisible(true);
      } catch (error) {
        console.error("Error loading cookie banner settings", error);
        // On error, we fail open safely without bugging user
      }
    }

    // Give a slight delay so it doesn't block initial render
    const timer = setTimeout(initBanner, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    document.cookie = "cookie_consent=accepted; max-age=31536000; path=/";
    setIsVisible(false);
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: 'accepted' }));
  };

  const handleReject = () => {
    document.cookie = "cookie_consent=rejected; max-age=31536000; path=/";
    setIsVisible(false);
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: 'rejected' }));
  };

  if (!isVisible || !settings) return null;

  const positionClass =
    settings.position === 'top' ? 'top-0 left-0 right-0' :
    settings.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg w-[90%] rounded-xl shadow-2xl' :
    'bottom-0 left-0 right-0';

  return (
    <div
      className={`fixed z-[9999] p-4 md:p-6 shadow-xl border border-black/5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between transition-all duration-500 ease-in-out ${positionClass}`}
      style={{
        backgroundColor: settings.backgroundColor || '#ffffff',
        color: settings.textColor || '#000000',
      }}
    >
      <div className="flex-1 text-sm md:text-base leading-relaxed text-center sm:text-left">
        {settings.bannerText}
        <a href="/privacy" className="underline ml-1 font-medium hover:opacity-80 transition-opacity">Privacy Policy</a>
      </div>

      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 w-full sm:w-auto shrink-0">
        <Button
          onClick={handleReject}
          variant="outline"
          className="font-medium bg-transparent border-2 h-11 px-6 whitespace-nowrap"
          style={{
            borderColor: settings.buttonColor || '#000000',
            color: settings.buttonColor || '#000000',
          }}
        >
          {settings.rejectButton || 'Reject All'}
        </Button>
        <Button
          onClick={handleAccept}
          className="font-medium h-11 px-8 hover:opacity-90 whitespace-nowrap shadow-md transition-opacity"
          style={{
            backgroundColor: settings.buttonColor || '#000000',
            color: '#ffffff',
          }}
        >
          {settings.acceptButton || 'Accept All'}
        </Button>
      </div>
    </div>
  );
}
