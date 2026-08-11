import { CardSkeleton } from "@/components/skeletons/card-skeleton";
import { PageLoadingShell } from "@/components/skeletons/page-loading";

export default function Loading() {
  return (
    <PageLoadingShell maxWidth="max-w-2xl">
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </PageLoadingShell>
  );
}