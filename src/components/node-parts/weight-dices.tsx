import { Cube } from "../core/icons";

interface Props {
  weight: number;
}

export function WeightDices({ weight }: Props) {
  if (weight <= 0) {
    return null;
  }

  const floor = Math.floor(weight);
  const diceCount = Math.max(1, floor);
  const float = weight > floor;

  return (
    <div className="flex">
      {Array(diceCount).fill(0).map((_, index) => <Cube key={index} />)}
      {float &&
        <span className="ml-1">
          [{weight}]
        </span>
      }
    </div>
  );
}
