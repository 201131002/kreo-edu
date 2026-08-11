import { GridSkeleton } from "@/components/skeletons/grid-skeleton";
import { CardSkeleton } from "@/components/skeletons/card-skeleton";
import { PageLoadingShell } from "@/components/skeletons/page-loading";

export default function Loading() {
  return (
    <PageLoadingShell>
      <div className="grid gap-8 lg:grid-cols-2">
        <CardSkeleton />
        <GridSkeleton columns={1} rows={3} />
      </div>
    </PageLoadingShell>
  );
}