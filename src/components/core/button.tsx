import type { PropsWithChildren } from "react";

interface Props {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export default function Button({ onClick, children }: PropsWithChildren<Props>) {
  return (
    <button onClick={onClick} className="border border-slate-400 px-2 pt-0.5 pb-1 rounded-lg text-sm bg-slate-50 hover:bg-white">
      {children}
    </button>
    );
}
