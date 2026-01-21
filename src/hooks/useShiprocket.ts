"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "shiprocket_config";

export interface ShiprocketConfig {
  email: string;
  password: string;
  token?: string;
  tokenExpiry?: number;
  pickupLocation?: string;
}

export const useShiprocket = () => {
  const [config, setConfig] = useState<ShiprocketConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Check if token is expired
          if (parsed.tokenExpiry && Date.now() > parsed.tokenExpiry) {
            setConfig({ ...parsed, token: undefined, tokenExpiry: undefined });
          } else {
            setConfig(parsed);
          }
        } catch (e) {
          console.error("Failed to parse Shiprocket config:", e);
          setConfig(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const refreshToken = async () => {
    if (!config?.email || !config?.password) {
      return false;
    }

    try {
      const response = await fetch("/api/shiprocket/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: config.email,
          password: config.password,
        }),
      });

      if (response.ok) {
        const { token } = await response.json();
        const updatedConfig = {
          ...config,
          token,
          tokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
        setConfig(updatedConfig);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };

  return {
    config,
    loading,
    isConfigured: !!config?.email && !!config?.password,
    hasToken: !!config?.token,
    refreshToken,
  };
};
