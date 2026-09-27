/**
 * i18n/index.js
 *
 * i18next initialization for KrishiSetu.
 * - All translations are bundled locally (no network requests).
 * - English is the default and fallback language.
 * - Import this file once at the app entry point (App.jsx) to initialize.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
