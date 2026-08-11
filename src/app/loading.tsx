import { PageLoadingShell } from "@/components/skeletons/page-loading";
import { GridSkeleton } from "@/components/skeletons/grid-skeleton";

export default function RootLoading() {
  return (
    <PageLoadingShell>
      <GridSkeleton columns={3} rows={2} />
    </PageLoadingShell>
  );
}