import { GridSkeleton } from "@/components/skeletons/grid-skeleton";
import { PageLoadingShell } from "@/components/skeletons/page-loading";

export default function Loading() {
  return (
    <PageLoadingShell maxWidth="max-w-4xl">
      <GridSkeleton columns={2} rows={2} />
    </PageLoadingShell>
  );
}