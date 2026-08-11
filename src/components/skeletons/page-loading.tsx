import { cn } from "@/lib/utils";

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mb-8 animate-pulse", className)}>
      <div className="h-8 w-2/5 max-w-xs rounded-xl bg-primary/10" />
      <div className="mt-3 h-4 w-3/5 max-w-md rounded-lg bg-primary/10" />
    </div>
  );
}

export function PageLoadingShell({
  children,
  maxWidth = "max-w-6xl",
}: {
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className={cn("mx-auto px-4 py-10", maxWidth)}>
      <PageHeaderSkeleton />
      {children}
    </div>
  );
}