import { CardSkeleton } from "@/components/skeletons/card-skeleton";
import { PageLoadingShell } from "@/components/skeletons/page-loading";

export default function Loading() {
  return (
    <PageLoadingShell>
      <div className="mb-10 space-y-4">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-primary/10" />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="space-y-4">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-primary/10" />
        <div className="grid gap-4 sm:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </PageLoadingShell>
  );
}