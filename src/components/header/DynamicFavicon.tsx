"use client";

import { useEffect } from "react";

const messages = [
  "Premium Dry Fruits & Spices",
  "100% Authentic Products",
  "Free Shipping on Orders Above ₹999",
  "Delivering Worldwide",
  "Al Fajer - Quality You Can Trust",
];

export const DynamicFavicon = () => {
  useEffect(() => {
    let currentIndex = 0;
    const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    const originalTitle = document.title;

    if (!favicon) return;

    const updateFaviconAndTitle = () => {
      // Update title
      document.title = messages[currentIndex];

      // Favicon is already set in layout, just update title
      currentIndex = (currentIndex + 1) % messages.length;
    };

    // Update every 8 seconds (slow rotation)
    const interval = setInterval(updateFaviconAndTitle, 8000);

    // Initial update
    updateFaviconAndTitle();

    return () => {
      clearInterval(interval);
      document.title = originalTitle;
    };
  }, []);

  return null;
};
