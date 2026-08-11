import { PageLoadingShell } from "@/components/skeletons/page-loading";
import { GridSkeleton } from "@/components/skeletons/grid-skeleton";

export default function Loading() {
  return (
    <PageLoadingShell>
      <GridSkeleton columns={2} rows={2} />
    </PageLoadingShell>
  );
}