import { LanguageSelector } from "./language-selector";
import { uiLanguages } from "@/lib/constants";
import { useLanguage } from "@/hooks/use-language";

type Props = {
  brief?: boolean;
}

export function UiLanguageSelector({ brief = false }: Props) {
  const { languageCode, setLanguageCode } = useLanguage();

  return (
    <LanguageSelector
      languages={uiLanguages}
      currentLanguageCode={languageCode}
      brief={brief}
      onSelect={setLanguageCode}
    />
  );
}
