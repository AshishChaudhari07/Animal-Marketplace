import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import gu from './locales/gu.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';
import mw from './locales/mw.json';

const resources = {
  en: { translation: en },
  gu: { translation: gu },
  hi: { translation: hi },
  mr: { translation: mr },
  mw: { translation: mw }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage']
    }
  });

export default i18n;
