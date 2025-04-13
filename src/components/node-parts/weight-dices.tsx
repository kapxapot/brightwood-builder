import { forwardRef } from "react";
import { Cube } from "../core/icons";

type Props = {
  weight: number;
}

const WeightDices = forwardRef<HTMLDivElement, Props>(({ weight }, ref) => {
  if (weight <= 0) {
    return null;
  }

  const floor = Math.floor(weight);
  const diceCount = Math.max(1, floor);
  const float = weight > floor;

  return (
    <div ref={ref} className="flex">
      {Array(diceCount).fill(0).map((_, index) => <Cube key={index} />)}
      {float &&
        <span className="ml-1">
          [{weight}]
        </span>
      }
    </div>
  );
});

WeightDices.displayName = "WeightDices";

export default WeightDices;
