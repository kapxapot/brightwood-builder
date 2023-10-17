import { type PropsWithChildren } from 'react';

interface Props {
  className?: string,
  selected: boolean;
}

export default function NodeShell({ className, selected, children }: PropsWithChildren<Props>) {
  return (
    <div className={`p-2 shadow-md rounded-md border w-[250px] ${selected ? "border-stone-600" : "border-stone-400"} ${className}`}>
      {children}
    </div>
  );
}
