import { useTranslation } from "react-i18next";

export function useLanguage() {
  const { i18n } = useTranslation();

  const languageCode = i18n.resolvedLanguage!;

  const setLanguageCode = (code: string) => {
    i18n.changeLanguage(code);
  }

  return { languageCode, setLanguageCode };
}
