import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "primary",
  children,
}: {
  className?: string;
  variant?: "primary" | "secondary" | "tertiary";
  children: React.ReactNode;
}) {
  const variants = {
    primary: "bg-primary/15 text-primary",
    secondary: "bg-secondary/15 text-secondary",
    tertiary: "bg-tertiary/15 text-tertiary",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}