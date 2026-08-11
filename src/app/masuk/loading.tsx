import { CardSkeleton } from "@/components/skeletons/card-skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <CardSkeleton className="h-80 w-full max-w-md" />
    </div>
  );
}