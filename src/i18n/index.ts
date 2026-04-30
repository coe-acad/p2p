import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';

// Get saved language or default to English
const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: translations,
    lng: savedLanguage,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

// Silence i18next informational logs in dev console while keeping warnings/errors.
if (i18n.services?.logger) {
  i18n.services.logger.log = () => {};
}

export default i18n;
