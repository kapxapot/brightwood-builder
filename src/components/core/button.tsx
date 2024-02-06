import type { PropsWithChildren } from "react";

type Size = "sm" | "norm" | "lg";

interface Props {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  size?: Size;
  disabled?: boolean;
}

export default function Button({ onClick, size = "norm", disabled, children }: PropsWithChildren<Props>) {
  const sizeStyle: Record<Size, string> = {
    "sm": "text-sm px-1.5 pb-0.5 rounded-md",
    "norm": "text-sm px-2 pt-0.5 pb-1 rounded-lg",
    "lg": "px-3 pt-0.5 pb-1 rounded-lg"
  };

  return (
    <button
      onClick={onClick}
      className={`border border-slate-400 ${sizeStyle[size]} bg-slate-50 enabled:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed`}
      disabled={disabled}
    >
      {children}
    </button>
    );
}
