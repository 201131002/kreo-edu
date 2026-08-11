import { CardSkeleton } from "@/components/skeletons/card-skeleton";
import { cn } from "@/lib/utils";

export function GridSkeleton({
  columns = 3,
  rows = 2,
  className,
}: {
  columns?: number;
  rows?: number;
  className?: string;
}) {
  const total = columns * rows;

  return (
    <div
      className={cn(
        "grid gap-6",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: total }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}