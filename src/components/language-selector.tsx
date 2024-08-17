import { languages } from "@/lib/constants";
import { LanguageInfo } from "@/lib/types";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Language } from "./language";

interface Props {
  expanded?: boolean;
  hideIcon?: boolean;
}

export function LanguageSelector({ expanded = false, hideIcon = false }: Props) {
  const { i18n } = useTranslation();

  const currentLanguageCode = i18n.resolvedLanguage;
  const currentLanguage = languages.find(lng => lng.code === currentLanguageCode);

  const isCurrent = (lng: LanguageInfo) => currentLanguageCode === lng.code;
  const setLanguage = (code: string) => i18n.changeLanguage(code);

  const otherLanguages = languages.filter(lng => !isCurrent(lng));

  return (
    <div className="flex justify-center rounded-md w-auto">
      <Select
        onValueChange={value => setLanguage(value)}
        defaultValue={currentLanguageCode}
      >
        <SelectTrigger
          className={`hover:bg-gray-200 py-1.5 ${expanded ? "pr-1 pl-2" : "px-0 justify-center"} h-auto border-0 shadow-none ${expanded ? "w-24" : "w-full"}`}
          hideIcon={hideIcon}
        >
          <SelectValue aria-label={currentLanguage?.name}>
            {currentLanguage &&
              <Language
                brief={!expanded}
                language={currentLanguage}
              />
            }
          </SelectValue>
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
                <Language language={language} />
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
