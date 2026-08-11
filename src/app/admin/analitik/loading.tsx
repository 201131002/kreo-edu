import { CardSkeleton } from "@/components/skeletons/card-skeleton";
import { GridSkeleton } from "@/components/skeletons/grid-skeleton";
import { PageLoadingShell } from "@/components/skeletons/page-loading";

export default function Loading() {
  return (
    <PageLoadingShell>
      <GridSkeleton columns={4} rows={1} className="mb-8" />
      <CardSkeleton />
    </PageLoadingShell>
  );
}