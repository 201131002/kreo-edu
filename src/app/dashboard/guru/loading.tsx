import { GridSkeleton } from "@/components/skeletons/grid-skeleton";
import { PageLoadingShell } from "@/components/skeletons/page-loading";

export default function Loading() {
  return (
    <PageLoadingShell>
      <GridSkeleton columns={3} rows={2} />
    </PageLoadingShell>
  );
}