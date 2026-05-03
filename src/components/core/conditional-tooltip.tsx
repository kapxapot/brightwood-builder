import { forwardRef, PropsWithChildren, ReactNode, Ref } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Side } from "@/lib/types";

type Props = {
  tooltip: ReactNode;
  show?: boolean;
  side?: Side;
  duration?: number;
  className?: string;
}

const ConditionalTooltip = forwardRef(({ tooltip, show, side, duration = 300, className, children }: PropsWithChildren<Props>, ref: Ref<HTMLDivElement>) => {
  if (!tooltip || !show) {
    return children;
  }

  return (
    <div ref={ref} className={className}>
      <TooltipProvider>
        <Tooltip delayDuration={duration}>
          <TooltipTrigger asChild>
            {children}
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
