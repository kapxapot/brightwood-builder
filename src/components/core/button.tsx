import type { PropsWithChildren } from "react";

interface Props {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  padding?: "sm" | "lg";
}

export default function Button({ onClick, padding, children }: PropsWithChildren<Props>) {
  const paddingStyle = padding === "sm"
    ? "px-1.5 pb-0.5"
    : "px-2 pt-0.5 pb-1";

  return (
    <button onClick={onClick} className={`border border-slate-400 ${paddingStyle} rounded-lg text-sm bg-slate-50 hover:bg-white`}>
      {children}
    </button>
    );
}
