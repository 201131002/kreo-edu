import { CardSkeleton } from "@/components/skeletons/card-skeleton";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { PageLoadingShell } from "@/components/skeletons/page-loading";

export default function Loading() {
  return (
    <PageLoadingShell maxWidth="max-w-3xl">
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="mb-4 h-6 w-40 animate-pulse rounded-lg bg-primary/10" />
      <TableSkeleton rows={8} columns={3} />
    </PageLoadingShell>
  );
}