import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const GURU_STUDENT_PAGE_SIZE = 10;

export function GuruStudentPagination({
  currentPage,
  totalCount,
  classId,
}: {
  currentPage: number;
  totalCount: number;
  classId: string;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / GURU_STUDENT_PAGE_SIZE));

  if (totalPages <= 1) return null;

  function buildUrl(page: number) {
    const params = new URLSearchParams();
    if (classId !== "all") params.set("classId", classId);
    if (page > 1) params.set("page", String(page));
    const str = params.toString();
    return `/guru/siswa${str ? `?${str}` : ""}`;
  }

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination siswa"
    >
      <Link href={buildUrl(Math.max(1, currentPage - 1))}>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          aria-disabled={currentPage <= 1}
        >
          Sebelumnya
        </Button>
      </Link>

      {pages.map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="px-2 text-muted">
            ...
          </span>
        ) : (
          <Link key={page} href={buildUrl(page)}>
            <Button
              variant={page === currentPage ? "secondary" : "outline"}
              size="sm"
              className={cn("min-w-9", page === currentPage && "pointer-events-none")}
            >
              {page}
            </Button>
          </Link>
        )
      )}

      <Link href={buildUrl(Math.min(totalPages, currentPage + 1))}>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          aria-disabled={currentPage >= totalPages}
        >
          Berikutnya
        </Button>
      </Link>
    </nav>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}