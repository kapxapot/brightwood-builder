import type { EffectInvocation } from "../../entities/story-data";

interface Props {
  effect?: EffectInvocation;
}

export default function NodeEffect({ effect }: Props) {
  if (!effect) {
    return null;
  }

  return (
    <div className="text-sm">
      <span className="italic">effect:</span> {effect.name}()
    </div>
  );
}
