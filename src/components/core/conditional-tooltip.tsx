import { PropsWithChildren } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Side } from "@/lib/types";

interface Props {
  tooltip: string;
  show?: boolean;
  side?: Side;
  duration?: number;
}

export default function ConditionalTooltip({ tooltip, show, side, duration = 300, children }: PropsWithChildren<Props>) {
  if (!tooltip || !show) {
    return children;
  }

  return (
    <div>
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
}
