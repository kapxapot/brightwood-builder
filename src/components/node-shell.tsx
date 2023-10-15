import { type PropsWithChildren } from 'react';

interface Props {
  className?: string,
  selected: boolean;
}

export default function NodeShell({ className, selected, children }: PropsWithChildren<Props>) {
  return (
    <div className={`px-3 py-2 shadow-md rounded-md border-2 ${selected ? "border-stone-600" : "border-stone-400"} ${className}`}>
      {children}
    </div>
  );
}
