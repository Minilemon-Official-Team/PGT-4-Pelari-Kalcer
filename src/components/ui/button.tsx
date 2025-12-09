import { forwardRef } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
};

const baseStyles =
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-(--accent) text-(--surface) hover:bg-(--accent-strong) focus-visible:outline-(--accent-strong)",
  secondary:
    "bg-(--surface) text-(--text-primary) border border-slate-200 hover:bg-slate-50 focus-visible:outline-(--accent)",
  outline:
    "border border-slate-300 bg-white text-(--text-primary) hover:bg-slate-50 focus-visible:outline-(--accent)",
  ghost: "bg-transparent text-(--text-primary) hover:bg-slate-100 focus-visible:outline-(--accent)",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], className)}
      type={type}
      {...props}
    />
  ),
);

Button.displayName = "Button";
