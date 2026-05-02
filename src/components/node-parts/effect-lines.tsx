import type { EffectInvocation } from "@/entities/story-data";
import { Sparkles } from "../core/icons";

type Props = {
  effects: EffectInvocation[];
  className?: string;
};

const formatEffectInvocation = (effect: EffectInvocation) => {
  if (typeof effect === "string") {
    return effect;
  }

  const { name, args } = effect;
  const formattedArgs = args?.map(arg => JSON.stringify(arg)).join(", ");
  return `${name}(${formattedArgs ?? ""})`;
};

export default function EffectLines({ effects, className }: Props) {
  return (
    <div className={`flex flex-col gap-0.5 text-left ${className ?? ""}`}>
      {effects.map((effect, index) => (
        <div key={`${formatEffectInvocation(effect)}-${index}`} className="flex gap-1">
          <Sparkles />
          <div className="break-words">{formatEffectInvocation(effect)}</div>
        </div>
      ))}
    </div>
  );
}
