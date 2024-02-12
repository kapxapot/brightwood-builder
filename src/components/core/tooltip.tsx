import { PropsWithChildren } from "react";
import { Side } from "@/lib/types";
import ConditionalTooltip from "./conditional-tooltip";

interface Props {
  tooltip: string;
  side?: Side;
  duration?: number;
}

export default function Tooltip({ children, ...props }: PropsWithChildren<Props>) {
  return (
    <ConditionalTooltip {...props} show={true}>
      {children}
    </ConditionalTooltip>
  );
}
