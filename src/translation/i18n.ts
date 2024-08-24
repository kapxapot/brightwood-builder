import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import es from "./locales/es.json";
import it from "./locales/it.json";
import ja from "./locales/ja.json";
import ru from "./locales/ru.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    detection: {
      order: ["localStorage", "querystring", "navigator"],
      caches: ["localStorage"]
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    },
    resources: {
      en: { translation: en },
      es: { translation: es },
      it: { translation: it },
      ja: { translation: ja },
      ru: { translation: ru }
    }
  });

export default i18n;
