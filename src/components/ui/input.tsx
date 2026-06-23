import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-12 w-full rounded-2xl border-2 border-primary/10 bg-white px-4 text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-28 w-full rounded-2xl border-2 border-primary/10 bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Label = ({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn("mb-2 block text-sm font-semibold text-foreground", className)}
    {...props}
  >
    {children}
  </label>
);

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-12 w-full rounded-2xl border-2 border-primary/10 bg-white px-4 text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";