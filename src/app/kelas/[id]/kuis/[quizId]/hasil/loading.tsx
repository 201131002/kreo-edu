import { CardSkeleton } from "@/components/skeletons/card-skeleton";
import { PageLoadingShell } from "@/components/skeletons/page-loading";

export default function Loading() {
  return (
    <PageLoadingShell maxWidth="max-w-lg">
      <div className="flex min-h-[50vh] items-center justify-center">
        <CardSkeleton className="w-full" />
      </div>
    </PageLoadingShell>
  );
}