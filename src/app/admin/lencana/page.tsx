import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { AdminFlashAlert } from "@/components/admin/flash-alert";
import { CreateBadgeForm } from "@/components/admin/create-badge-form";
import { BadgeRow } from "@/components/admin/badge-row";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function AdminLencanaPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const sp = await searchParams;

  const badges = await prisma.badge.findMany({
    orderBy: [{ criteria: "asc" }, { criteriaValue: "asc" }],
    include: {
      _count: { select: { studentBadges: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Kelola Lencana"
        description="Tambah, ubah, atau hapus lencana pencapaian siswa"
      />

      <Suspense>
        <AdminFlashAlert success={sp.success} error={sp.error} />
      </Suspense>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardTitle>Tambah Lencana Baru</CardTitle>
          <CardDescription className="mt-1">
            Siswa mendapatkan lencana otomatis saat memenuhi kriteria
          </CardDescription>
          <div className="mt-4">
            <CreateBadgeForm />
          </div>
        </Card>

        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-foreground">
            {badges.length} Lencana Aktif
          </h2>
          {badges.map((badge) => (
            <BadgeRow key={badge.id} badge={badge} />
          ))}
        </div>
      </div>
    </div>
  );
}