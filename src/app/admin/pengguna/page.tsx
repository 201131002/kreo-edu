import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { AdminFlashAlert } from "@/components/admin/flash-alert";
import { UserStats } from "@/components/admin/user-stats";
import { UserFilters } from "@/components/admin/user-filters";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { UserPagination, PAGE_SIZE } from "@/components/admin/user-pagination";
import { UserRow } from "@/components/admin/user-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";
import type { UserRole } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";

export default async function AdminPenggunaPage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
    error?: string;
    role?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const t = await getTranslations("admin.users");
  const tc = await getTranslations("common");
  const filterRole = sp.role ?? "all";
  const query = sp.q?.trim() ?? "";
  const currentPage = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const where = buildWhere(filterRole, query);

  const [roleCounts, totalCount, users] = await Promise.all([
    prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    }),
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
        studentProfile: {
          select: { currentLevel: true, virtualCurrency: true, currentExp: true },
        },
        _count: {
          select: {
            classes: true,
            enrollments: true,
            quizAttempts: true,
          },
        },
      },
    }),
  ]);

  const counts = {
    all: roleCounts.reduce((s, r) => s + r._count.id, 0),
    SISWA: roleCounts.find((r) => r.role === "SISWA")?._count.id ?? 0,
    GURU: roleCounts.find((r) => r.role === "GURU")?._count.id ?? 0,
    ADMIN: roleCounts.find((r) => r.role === "ADMIN")?._count.id ?? 0,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader title={t("title")} description={t("description")} />

      <AdminFlashAlert success={sp.success} error={sp.error} />

      <UserStats
        total={counts.all}
        siswa={counts.SISWA}
        guru={counts.GURU}
        admin={counts.ADMIN}
      />

      <div className="mb-10">
        <CreateUserForm />
      </div>

      <Suspense fallback={<div className="mb-6 h-24 animate-pulse rounded-2xl bg-white/60" />}>
        <UserFilters
          currentRole={filterRole}
          currentQuery={query}
          counts={counts}
        />
      </Suspense>

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("title")}
          description={
            query ? t("noSearchResults", { query }) : t("noUsers")
          }
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            {tc("showingUsersPaged", { shown: users.length, total: totalCount })}
            {totalCount > PAGE_SIZE && ` · ${tc("page", { page: currentPage })}`}
            {filterRole !== "all" && ` · ${tc("filterRole", { role: filterRole })}`}
            {query && ` · ${tc("searchQuery", { query })}`}
          </p>
          {users.map((user) => (
            <UserRow
              key={user.id}
              id={user.id}
              nama={user.nama}
              email={user.email}
              role={user.role}
              isSelf={user.id === session!.user.id}
              createdAt={user.createdAt.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              studentProfile={user.studentProfile}
              stats={{
                classes: user._count.classes,
                enrollments: user._count.enrollments,
                quizAttempts: user._count.quizAttempts,
              }}
            />
          ))}
          <UserPagination
            currentPage={currentPage}
            totalCount={totalCount}
            role={filterRole}
            query={query}
          />
        </div>
      )}
    </div>
  );
}

function buildWhere(
  role: string,
  query: string
): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};

  if (role !== "all" && ["SISWA", "GURU", "ADMIN"].includes(role)) {
    where.role = role as UserRole;
  }

  if (query) {
    where.OR = [
      { nama: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
    ];
  }

  return where;
}