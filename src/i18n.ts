import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import ptTranslation from './locales/pt/translation.json';

const resources = {
  en: {
    translation: enTranslation
  },
  pt: {
    translation: ptTranslation
  }
};

i18n
  // Detectar idioma do browser automaticamente
  .use(LanguageDetector)
  // Passar a instância para o react-i18next
  .use(initReactI18next)
  // Inicializar
  .init({
    resources,
    fallbackLng: 'pt', // Idioma de segurança se o do browser não for suportado
    debug: false,
    
    interpolation: {
      escapeValue: false // React já escapa os valores contra XSS
    }
  });

export default i18n;
