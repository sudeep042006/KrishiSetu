/**
 * context/LanguageContext.jsx
 *
 * Language state management for KrishiSetu.
 * Mirrors the ThemeContext pattern — simple, no heavy abstractions.
 *
 * - Reads preferredLanguage from AsyncStorage on startup.
 * - Exposes changeLanguage() to switch and persist language immediately.
 * - Provides currentLanguage and SUPPORTED_LANGUAGES to all children.
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
];

export const LanguageContext = createContext({
  currentLanguage: 'en',
  changeLanguage: async () => {},
  SUPPORTED_LANGUAGES,
});

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  // On mount: restore persisted language preference
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem('preferredLanguage');
        if (stored && stored !== i18n.language) {
          await i18n.changeLanguage(stored);
          setCurrentLanguage(stored);
        } else if (stored) {
          setCurrentLanguage(stored);
        }
      } catch (e) {
        console.warn('LanguageContext: could not load preferredLanguage', e);
      }
    };
    loadLanguage();
  }, []);

  /**
   * Switch the active language and persist the choice.
   * @param {string} langCode - 'en' | 'hi'
   */
  const changeLanguage = async (langCode) => {
    try {
      await i18n.changeLanguage(langCode);
      setCurrentLanguage(langCode);
      await AsyncStorage.setItem('preferredLanguage', langCode);
    } catch (e) {
      console.error('LanguageContext: failed to change language', e);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Convenience hook with failsafe
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      currentLanguage: i18n.language || 'en',
      changeLanguage: async (langCode) => {
        await i18n.changeLanguage(langCode);
        await AsyncStorage.setItem('preferredLanguage', langCode);
      },
      SUPPORTED_LANGUAGES,
    };
  }
  return context;
};
