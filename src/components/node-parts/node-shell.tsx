import { cn } from "@/lib/utils";
import { type PropsWithChildren } from "react";

type Props = {
  selected: boolean;
  color?: string;
  spaceY?: "normal" | "none";
}

export default function NodeShell({ selected, color, spaceY = "normal", children }: PropsWithChildren<Props>) {
  return (
    <div
      className={cn(
        "p-2 shadow-md rounded-md border w-[250px] cursor-default",
        selected ? "border-stone-600" : "border-stone-400",
        spaceY === "normal" ? "space-y-2" : "",
        color
      )}
    >
      {children}
    </div>
  );
}
