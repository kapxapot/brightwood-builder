import { type PropsWithChildren } from "react";

interface Props {
  selected: boolean;
  color?: string;
  spaceY?: "normal" | "none";
}

export default function NodeShell({ selected, color, spaceY = "normal", children }: PropsWithChildren<Props>) {
  const spaceYStyle = spaceY === "normal" ? "space-y-2" : null;

  return (
    <div className={`p-2 shadow-md rounded-md border w-[250px] ${selected ? "border-stone-600" : "border-stone-400"} ${color} ${spaceYStyle} cursor-default`}>
      {children}
    </div>
  );
}
