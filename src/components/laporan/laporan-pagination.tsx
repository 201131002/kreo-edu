import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const LAPORAN_PAGE_SIZE = 10;

export async function LaporanPagination({
  currentPage,
  totalCount,
}: {
  currentPage: number;
  totalCount: number;
}) {
  const t = await getTranslations("common");
  const totalPages = Math.max(1, Math.ceil(totalCount / LAPORAN_PAGE_SIZE));

  if (totalPages <= 1) return null;

  function buildUrl(page: number) {
    return page > 1 ? `/laporan?page=${page}` : "/laporan";
  }

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination laporan"
    >
      <Link href={buildUrl(Math.max(1, currentPage - 1))}>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          aria-disabled={currentPage <= 1}
        >
          {t("previous")}
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
          {t("nextPage")}
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