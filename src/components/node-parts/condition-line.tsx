import { Condition } from "../core/icons";

type Props = {
  condition: string;
  className?: string;
};

export default function ConditionLine({ condition, className }: Props) {
  return (
    <div className={`flex gap-1 text-left ${className ?? ""}`}>
      <Condition />
      <div className="break-words">{condition}</div>
    </div>
  );
}
