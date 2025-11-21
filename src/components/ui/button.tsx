import { forwardRef } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

const baseStyles =
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-cyan-500 text-slate-950 hover:bg-cyan-400 focus-visible:outline-cyan-600",
  secondary: "bg-slate-800 text-white hover:bg-slate-700 focus-visible:outline-slate-600",
  ghost: "bg-transparent text-white hover:bg-white/10 focus-visible:outline-white",
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
