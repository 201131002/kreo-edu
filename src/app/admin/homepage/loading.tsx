import { CardSkeleton } from "@/components/skeletons/card-skeleton";
import { PageLoadingShell } from "@/components/skeletons/page-loading";

export default function Loading() {
  return (
    <PageLoadingShell maxWidth="max-w-4xl">
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </PageLoadingShell>
  );
}