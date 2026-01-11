"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export interface UserSettings {
  userId: string;
  notifications: {
    orderUpdates: boolean;
    promotionalEmails: boolean;
    newProducts: boolean;
    specialOffers: boolean;
  };
  privacy: {
    dataCollection: boolean;
    thirdPartySharing: boolean;
  };
}

interface SettingsContextType {
  settings: UserSettings | null;
  updateNotificationSetting: (key: keyof UserSettings['notifications'], value: boolean) => void;
  updatePrivacySetting: (key: keyof UserSettings['privacy'], value: boolean) => void;
  loadSettings: (userId: string) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const STORAGE_KEY = 'al-fajr-settings';

const DEFAULT_SETTINGS: Omit<UserSettings, 'userId'> = {
  notifications: {
    orderUpdates: true,
    promotionalEmails: true,
    newProducts: true,
    specialOffers: true,
  },
  privacy: {
    dataCollection: true,
    thirdPartySharing: false,
  },
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const loadSettings = useCallback((userId: string) => {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
      } catch {
        // If parsing fails, create default settings
        const defaultSettings: UserSettings = {
          userId,
          ...DEFAULT_SETTINGS,
        };
        setSettings(defaultSettings);
        localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(defaultSettings));
      }
    } else {
      // Create and save default settings
      const defaultSettings: UserSettings = {
        userId,
        ...DEFAULT_SETTINGS,
      };
      setSettings(defaultSettings);
      localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(defaultSettings));
    }
  }, []);

  const updateNotificationSetting = useCallback(
    (key: keyof UserSettings['notifications'], value: boolean) => {
      if (!settings) return;
      const updatedSettings: UserSettings = {
        ...settings,
        notifications: {
          ...settings.notifications,
          [key]: value,
        },
      };
      setSettings(updatedSettings);
      localStorage.setItem(`${STORAGE_KEY}-${settings.userId}`, JSON.stringify(updatedSettings));
    },
    [settings]
  );

  const updatePrivacySetting = useCallback(
    (key: keyof UserSettings['privacy'], value: boolean) => {
      if (!settings) return;
      const updatedSettings: UserSettings = {
        ...settings,
        privacy: {
          ...settings.privacy,
          [key]: value,
        },
      };
      setSettings(updatedSettings);
      localStorage.setItem(`${STORAGE_KEY}-${settings.userId}`, JSON.stringify(updatedSettings));
    },
    [settings]
  );

  const resetSettings = useCallback(() => {
    setSettings(null);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateNotificationSetting,
        updatePrivacySetting,
        loadSettings,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === null) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
