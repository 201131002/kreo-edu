import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-[0_6px_0_#0284c7] hover:brightness-105 hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-white shadow-[0_6px_0_#d97706] hover:brightness-105 hover:-translate-y-0.5",
        tertiary:
          "bg-tertiary text-white shadow-[0_6px_0_#7c3aed] hover:brightness-105 hover:-translate-y-0.5",
        outline:
          "border-2 border-primary/20 bg-white text-foreground shadow-soft hover:border-primary/40",
        ghost: "text-foreground hover:bg-primary/10",
      },
      size: {
        sm: "h-11 px-4 text-sm",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";