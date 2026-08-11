import { cn } from "@/lib/utils";

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-pulse overflow-hidden rounded-3xl border border-primary/10 bg-white/80 shadow-soft",
        className
      )}
    >
      <div className="grid gap-px bg-primary/5 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`head-${i}`} className="h-4 rounded bg-primary/15" />
        ))}
      </div>
      <div className="divide-y divide-primary/5">
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={`row-${row}`}
            className="grid gap-4 p-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, col) => (
              <div
                key={`cell-${row}-${col}`}
                className="h-4 rounded-lg bg-primary/10"
                style={{ width: col === 0 ? "80%" : "60%" }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}