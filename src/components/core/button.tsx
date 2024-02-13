import type { PropsWithChildren } from "react";

type Size = "small" | "default" | "large" | "toolbar";

interface Props {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  size?: Size;
  disabled?: boolean;
}

export default function Button({ onClick, size = "default", disabled, children }: PropsWithChildren<Props>) {
  const sizeStyle: Record<Size, string> = {
    "small": "text-sm px-1 py-0.5 rounded-md",
    "default": "text-sm px-2 pb-1 pt-0.5 rounded-lg",
    "large": "px-3 py-1 rounded-lg",
    "toolbar": "p-1 rounded-md"
  };

  return (
    <button
      onClick={onClick}
      className={`border border-slate-400 ${sizeStyle[size]} bg-slate-50 enabled:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex gap-1 items-center`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
