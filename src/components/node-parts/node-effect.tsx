import { useTranslation } from "react-i18next";
import type { EffectInvocation } from "../../entities/story-data";

type Props = {
  effect?: EffectInvocation;
}

export default function NodeEffect({ effect }: Props) {
  const { t } = useTranslation();

  if (!effect) {
    return null;
  }

  return (
    <div className="text-sm">
      <span className="italic">{t("effect")}:</span> {effect.name}()
    </div>
  );
}
