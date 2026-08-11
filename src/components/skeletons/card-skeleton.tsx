import { cn } from "@/lib/utils";

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-3xl border border-primary/10 bg-white/80 p-6 shadow-soft",
        className
      )}
    >
      <div className="mb-4 h-5 w-1/3 rounded-lg bg-primary/10" />
      <div className="mb-2 h-4 w-full rounded-lg bg-primary/10" />
      <div className="h-4 w-2/3 rounded-lg bg-primary/10" />
    </div>
  );
}