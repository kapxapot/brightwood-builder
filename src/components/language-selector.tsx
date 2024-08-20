import { LanguageInfo } from "@/lib/types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Language } from "./language";
import { useTranslation } from "react-i18next";

interface Props {
  brief?: boolean;
  className?: string;
  currentLanguageCode?: string;
  disabled?: boolean;
  languages: LanguageInfo[];
  onSelect?: (code: string) => void;
}

export function LanguageSelector({ brief = false, className, currentLanguageCode, disabled = false, languages, onSelect }: Props) {
  const { t } = useTranslation();

  const currentLanguage = languages.find(lng => lng.code === currentLanguageCode);

  const isCurrent = (lng: LanguageInfo) => currentLanguageCode === lng.code;

  const otherLanguages = languages.filter(lng => !isCurrent(lng));

  return (
    <Select
      onValueChange={value => onSelect?.(value)}
      defaultValue={currentLanguageCode ?? ""}
      value={currentLanguageCode ?? ""}
      disabled={disabled}
    >
      <SelectTrigger
        className={`hover:bg-gray-200 ${brief ? "px-1.5 py-1.5 justify-center" : "pr-1 pl-2 py-1" } h-auto border-0 shadow-none ${brief ? "" : "w-auto"} rounded-lg ${className}`}
        hideIcon={brief}
      >
        {currentLanguage && (
          <SelectValue aria-label={currentLanguage.name}>
            <Language
              brief={brief}
              language={currentLanguage}
            />
          </SelectValue>
        )}
        {!currentLanguage &&
          <span className="opacity-50">
            {t("Language")}
          </span>
        }
      </SelectTrigger>
      <SelectContent
        className="min-w-min"
      >
        <SelectGroup>
          {otherLanguages.map(language => (
            <SelectItem
              className="py-1 pr-2 cursor-pointer"
              key={language.code}
              value={language.code}
            >
              <Language
                className="shadow shadow-gray-400"
                language={language}
              />
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
