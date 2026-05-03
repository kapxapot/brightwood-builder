import { cn } from "@/lib/utils";
import { type PropsWithChildren, type ReactNode } from "react";

type Props = {
  selected: boolean;
  color?: string;
  spaceY?: "normal" | "none";
  actions?: ReactNode;
  readonly?: boolean;
}

export default function NodeShell({
  selected,
  color,
  spaceY = "normal",
  actions,
  readonly = false,
  children
}: PropsWithChildren<Props>) {
  return (
    <div
      className={cn(
        "group/node relative w-[250px] cursor-default rounded-md border p-2 shadow-md",
        selected ? "border-stone-600" : "border-stone-400",
        color
      )}
    >
      <div className={spaceY === "normal" ? "space-y-2" : ""}>
        {children}
      </div>
      {actions && !readonly && (
        <div
          className={cn(
            "pointer-events-none absolute left-full top-0 z-20 w-max pl-1.5 opacity-0 transition-opacity duration-150 group-focus-within/node:pointer-events-auto group-focus-within/node:opacity-100 group-hover/node:pointer-events-auto group-hover/node:opacity-100"
          )}
        >
          <div className="flex flex-col items-start gap-2">
            {actions}
          </div>
        </div>
      )}
    </div>
  );
}
