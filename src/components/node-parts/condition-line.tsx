import { cn } from "@/lib/utils";
import { Condition } from "../core/icons";

type Props = {
  condition: string | undefined;
  className?: string;
};

export default function ConditionLine({ condition, className }: Props) {
  if (!condition) {
    return null;
  }

  return (
    <div className={cn("flex min-w-0 gap-1.5 items-center", className)}>
      <Condition />
      <div className="truncate">
        {condition}
      </div>
    </div>
  );
}
