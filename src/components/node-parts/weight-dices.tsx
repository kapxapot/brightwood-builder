import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { Cube } from "../core/icons";

type Props = ComponentPropsWithoutRef<"div"> & {
  weight: number;
};

const WeightDices = forwardRef<HTMLDivElement, Props>(({ weight, className, ...props }, ref) => {
  if (weight <= 0) {
    return null;
  }

  const floor = Math.floor(weight);
  const diceCount = Math.max(1, floor);
  const float = weight > floor;

  return (
    <div ref={ref} className={cn("flex", className)} {...props}>
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
