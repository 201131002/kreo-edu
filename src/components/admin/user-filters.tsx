"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTransition } from "react";

const roles = [
  { id: "all", label: "Semua" },
  { id: "SISWA", label: "Siswa" },
  { id: "GURU", label: "Guru" },
  { id: "ADMIN", label: "Admin" },
] as const;

export function UserFilters({
  currentRole,
  currentQuery,
  counts,
}: {
  currentRole: string;
  currentQuery: string;
  counts: { all: number; SISWA: number; GURU: number; ADMIN: number };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function buildUrl(role: string, q?: string) {
    const params = new URLSearchParams();
    if (role !== "all") params.set("role", role);
    const query = q ?? currentQuery;
    if (query) params.set("q", query);
    const str = params.toString();
    return `/admin/pengguna${str ? `?${str}` : ""}`;
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-2 rounded-2xl bg-white/60 p-1.5">
        {roles.map((r) => {
          const isActive = currentRole === r.id;
          const count = counts[r.id as keyof typeof counts];
          return (
            <Link
              key={r.id}
              href={buildUrl(r.id)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
                isActive
                  ? "bg-secondary text-white shadow-sm"
                  : "text-muted hover:bg-secondary/10 hover:text-secondary"
              )}
            >
              {r.label} ({count})
            </Link>
          );
        })}
      </div>

      <form
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const q = String(fd.get("q") ?? "");
          startTransition(() => {
            router.push(buildUrl(currentRole, q));
          });
        }}
      >
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          name="q"
          defaultValue={currentQuery}
          placeholder="Cari nama atau email..."
          className="pl-11"
          disabled={pending}
        />
      </form>
    </div>
  );
}