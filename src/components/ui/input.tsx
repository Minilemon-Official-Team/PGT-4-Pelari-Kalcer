import { forwardRef } from "react";

import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-(--text-primary) shadow-sm transition focus:border-(--accent) focus-visible:outline-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
