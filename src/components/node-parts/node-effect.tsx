import { useTranslation } from "react-i18next";
import type { EffectInvocation } from "../../entities/story-data";

type Props = {
  effects?: EffectInvocation[];
};

const formatInvocation = (effect: EffectInvocation) => {
  const args = effect.args?.map(arg => JSON.stringify(arg)).join(", ");
  return `${effect.name}(${args ?? ""})`;
};

export default function NodeEffect({ effects }: Props) {
  const { t } = useTranslation();

  if (!effects?.length) {
    return null;
  }

  return (
    <div className="text-sm">
      <span className="italic">{t("entryEffects")}:</span>{" "}
      {effects.map(formatInvocation).join(", ")}
    </div>
  );
}
