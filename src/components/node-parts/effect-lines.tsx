import type { EffectInvocation } from "@/entities/story-data";
import { Sparkles } from "../core/icons";
import { cn } from "@/lib/utils";

type Props = {
  effects: EffectInvocation[] | undefined;
  className?: string;
  expanded?: boolean;
};

const formatEffectInvocation = (effect: EffectInvocation) => {
  if (typeof effect === "string") {
    return effect;
  }

  const { name, args } = effect;
  const formattedArgs = args?.map(arg => JSON.stringify(arg)).join(", ");
  return `${name}(${formattedArgs ?? ""})`;
};

export default function EffectLines({ effects, className, expanded = true }: Props) {
  if (!effects?.length) {
    return null;
  }

  if (!expanded) {
    return (
      <div className={cn("flex min-w-0 items-center gap-1.5", className)}>
        <Sparkles />
        <div className="min-w-0 truncate">
          {effects.map(formatEffectInvocation).join(", ")}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {effects.map((effect, index) => (
        <div key={index} className="flex min-w-0 items-center gap-1.5">
          <Sparkles />
          <div className="min-w-0 truncate">
            {formatEffectInvocation(effect)}
          </div>
        </div>
      ))}
    </div>
  );
}
