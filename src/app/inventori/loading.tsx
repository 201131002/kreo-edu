import { CardSkeleton } from "@/components/skeletons/card-skeleton";
import { GridSkeleton } from "@/components/skeletons/grid-skeleton";
import { PageLoadingShell } from "@/components/skeletons/page-loading";

export default function Loading() {
  return (
    <PageLoadingShell maxWidth="max-w-4xl">
      <div className="mb-6 h-10 w-full animate-pulse rounded-2xl bg-primary/10" />
      <CardSkeleton className="mb-8" />
      <GridSkeleton columns={2} rows={2} />
    </PageLoadingShell>
  );
}