import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

export function initI18n() {
  if (!i18n.isInitialized) {
    i18n
      .use(Backend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        lng: 'en',
        fallbackLng: 'en',
        supportedLngs: ['ca', 'es', 'en'],
        load: 'languageOnly',
        debug: true,
        interpolation: {
          escapeValue: false,
        },
      });
  }
  return i18n;
}

export default i18n;
