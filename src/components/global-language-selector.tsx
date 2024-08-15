import { languages } from "@/lib/constants";
import { useTranslation } from "react-i18next";

export function GlobalLanguageSelector() {
  const { i18n } = useTranslation();

  return (
    <div>
      {Object.keys(languages).map(lng => (
        <button
          key={lng}
          className={i18n.resolvedLanguage === lng ? "font-bold" : ""}
          onClick={() => i18n.changeLanguage(lng)}
        >
          {languages[lng]}
        </button>
      ))}
    </div>
  );
}
