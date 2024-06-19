import { PropsWithChildren } from "react";

export function TextInputLabel({ children }: PropsWithChildren) {
  return (
    <div className="text-xs opacity-50 font-bold mb-0.5">
      {children}
    </div>
  );
}
