import type { PropsWithChildren } from "react";

interface Props {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  size?: "sm" | "lg";
  disabled?: boolean;
}

export default function Button({ onClick, size, disabled, children }: PropsWithChildren<Props>) {
  const sizeStyle = size === "sm"
    ? "px-1.5 pb-0.5 rounded-md"
    : "px-2 pt-0.5 pb-1 rounded-lg";

  return (
    <button
      onClick={onClick}
      className={`border border-slate-400 ${sizeStyle} text-sm bg-slate-50 enabled:hover:bg-white disabled:opacity-50`}
      disabled={disabled}
    >
      {children}
    </button>
    );
}
