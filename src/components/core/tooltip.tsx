import { forwardRef, PropsWithChildren, ReactNode, Ref } from "react";
import { Side } from "@/lib/types";
import ConditionalTooltip from "./conditional-tooltip";

type Props = {
  tooltip: ReactNode;
  side?: Side;
  duration?: number;
}

const Tooltip = forwardRef(({ children, ...props }: PropsWithChildren<Props>, ref: Ref<HTMLDivElement>) => {
  return (
    <ConditionalTooltip ref={ref} {...props} show={true}>
      {children}
    </ConditionalTooltip>
  );
});

export default Tooltip;
