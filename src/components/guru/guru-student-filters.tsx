import Link from "next/link";
import { cn } from "@/lib/utils";

export function GuruStudentFilters({
  classes,
  currentClassId,
  counts,
}: {
  classes: { id: string; title: string }[];
  currentClassId: string;
  counts: Record<string, number>;
}) {
  function buildUrl(classId: string) {
    if (classId === "all") return "/guru/siswa";
    return `/guru/siswa?classId=${classId}`;
  }

  return (
    <div className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-white/60 p-1.5">
      <Link
        href={buildUrl("all")}
        className={cn(
          "rounded-xl px-4 py-2 text-sm font-semibold transition",
          currentClassId === "all"
            ? "bg-primary text-white shadow-sm"
            : "text-muted hover:bg-primary/10 hover:text-primary"
        )}
      >
        Semua Kelas ({counts.all ?? 0})
      </Link>
      {classes.map((cls) => (
        <Link
          key={cls.id}
          href={buildUrl(cls.id)}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-semibold transition",
            currentClassId === cls.id
              ? "bg-primary text-white shadow-sm"
              : "text-muted hover:bg-primary/10 hover:text-primary"
          )}
        >
          {cls.title} ({counts[cls.id] ?? 0})
        </Link>
      ))}
    </div>
  );
}