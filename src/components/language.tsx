import { LanguageInfo } from "@/lib/types";

type Props = {
  brief?: boolean;
  className?: string;
  language: LanguageInfo;
}

export function Language({ brief = false, className, language }: Props) {
  return (
    <div className="flex gap-1.5 items-center">
      <span className={`fi fi-${language.flagCode} ${className}`} />
      {!brief &&
        <span>{language.name}</span>
      }
    </div>
  );
}
