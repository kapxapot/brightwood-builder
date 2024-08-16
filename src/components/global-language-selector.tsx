import { languages } from "@/lib/constants";
import { LanguageInfo } from "@/lib/types";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Language } from "./language";

interface Props {
  expanded: boolean;
}

export function GlobalLanguageSelector({ expanded }: Props) {
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
          className={`hover:bg-gray-200 px-1 pl-2 h-auto py-1 border-0 shadow-none ${expanded ? "w-24" : "w-full"}`}
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
        <SelectContent>
          <SelectGroup>
            {otherLanguages.map(language => (
              <SelectItem
                className="cursor-pointer"
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
