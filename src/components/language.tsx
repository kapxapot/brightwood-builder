import { LanguageInfo } from "@/lib/types";

interface Props {
  brief?: boolean;
  language: LanguageInfo;
}

export function Language({ brief, language }: Props) {
  return (
    <div className="flex gap-1 items-center">
      <span className={`fi fi-${language.flagCode}`} />
      {!brief &&
        <span>{language.name}</span>
      }
    </div>
  );
}
