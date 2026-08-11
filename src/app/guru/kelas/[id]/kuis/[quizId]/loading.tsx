import { CardSkeleton } from "@/components/skeletons/card-skeleton";
import { PageLoadingShell } from "@/components/skeletons/page-loading";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";

export default function Loading() {
  return (
    <PageLoadingShell maxWidth="max-w-5xl">
      <CardSkeleton className="mb-6" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <TableSkeleton rows={5} columns={3} />
    </PageLoadingShell>
  );
}