import { languages } from "@/lib/constants";
import { LanguageInfo } from "@/lib/types";
import { useTranslation } from "react-i18next";

interface Props {
  expanded: boolean;
}

export function GlobalLanguageSelector({ expanded }: Props) {
  const { i18n } = useTranslation();

  const isCurrent = (lng: LanguageInfo) => i18n.resolvedLanguage === lng.code;

  return (
    <div className="flex flex-col items-center gap-2">
      {languages.map(lng => (
        <button
          key={lng.code}
          className={`flex gap-1 items-center ${isCurrent(lng) ? "font-bold" : ""} ${isCurrent(lng) && !expanded ? "border-solid border-2 border-blue-400" : ""}`}
          onClick={() => i18n.changeLanguage(lng.code)}
        >
          <span className={`fi fi-${lng.flagCode}`} />
          {expanded &&
            <span>{lng.name}</span>
          }
        </button>
      ))}
    </div>
  );
}
