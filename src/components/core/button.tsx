import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes, type PropsWithChildren, type Ref } from "react";

type Size = "small" | "default" | "large" | "toolbar";
type Variant = "default" | "primary";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: Size;
  variant?: Variant;
};

const Button = forwardRef(({ className, onClick, size = "default", type = "button", variant = "default", disabled, children, ...props }: PropsWithChildren<Props>, ref: Ref<HTMLButtonElement>) => {
  const sizeStyle: Record<Size, string> = {
    "small": "text-sm px-1 py-0.5 rounded-md",
    "default": "text-sm px-2 pb-1 pt-0.5 rounded-lg",
    "large": "px-3 py-1 rounded-lg",
    "toolbar": "p-1 rounded-md"
  };

  const variantStyle: Record<Variant, string> = {
    "default": "bg-slate-50 enabled:hover:bg-white",
    "primary": "bg-purple-200 enabled:hover:bg-purple-100"
  };

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      className={cn(
        "border border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed flex gap-1 items-center",
        sizeStyle[size],
        variantStyle[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
