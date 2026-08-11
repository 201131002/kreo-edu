import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { PageLoadingShell } from "@/components/skeletons/page-loading";

export default function Loading() {
  return (
    <PageLoadingShell>
      <TableSkeleton rows={6} columns={3} />
    </PageLoadingShell>
  );
}