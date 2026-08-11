import { GridSkeleton } from "@/components/skeletons/grid-skeleton";
import { CardSkeleton } from "@/components/skeletons/card-skeleton";
import { PageLoadingShell } from "@/components/skeletons/page-loading";

export default function Loading() {
  return (
    <PageLoadingShell>
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <CardSkeleton className="md:col-span-2" />
        <CardSkeleton />
      </div>
      <GridSkeleton columns={5} rows={2} className="mb-8 lg:grid-cols-5" />
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </PageLoadingShell>
  );
}