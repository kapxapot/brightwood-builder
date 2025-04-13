import { forwardRef } from "react";
import LanguageSelector from "./language-selector";
import { uiLanguages } from "@/lib/constants";
import { useLanguage } from "@/hooks/use-language";

type Props = {
  brief?: boolean;
}

const UiLanguageSelector = forwardRef<HTMLButtonElement, Props>(({ brief = false }, ref) => {
  const { languageCode, setLanguageCode } = useLanguage();

  return (
    <LanguageSelector
      ref={ref}
      languages={uiLanguages}
      currentLanguageCode={languageCode}
      brief={brief}
      onSelect={setLanguageCode}
    />
  );
});

UiLanguageSelector.displayName = "UiLanguageSelector";

export default UiLanguageSelector;
