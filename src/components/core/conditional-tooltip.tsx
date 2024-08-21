import { forwardRef, PropsWithChildren, ReactNode, Ref } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Side } from "@/lib/types";

type Props = {
  tooltip: ReactNode;
  show?: boolean;
  side?: Side;
  duration?: number;
}

const ConditionalTooltip = forwardRef(({ tooltip, show, side, duration = 300, children }: PropsWithChildren<Props>, ref: Ref<HTMLDivElement>) => {
  if (!tooltip || !show) {
    return children;
  }

  return (
    <div ref={ref}>
      <TooltipProvider>
        <Tooltip delayDuration={duration}>
          <TooltipTrigger asChild>
            <div>
              {children}
            </div>
          </TooltipTrigger>
          <TooltipContent side={side}>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
});

export default ConditionalTooltip;
