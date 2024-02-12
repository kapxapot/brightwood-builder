import { Cube } from "../core/icons";

interface Props {
  weight: number;
}

export function WeightDices({ weight }: Props) {
  const diceCount = Math.max(1, weight);
  const float = weight > Math.floor(weight);

  return (
    <span className="flex">
      {Array(diceCount).fill(0).map((_, index) => <Cube key={index} />)}
      {float ?? ` [${weight}]`}
    </span>
  );
}
