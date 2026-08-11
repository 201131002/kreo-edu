export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsFlashAlert } from "@/components/settings/flash-alert";
import { AvatarForm } from "@/components/settings/avatar-form";
import { NameForm } from "@/components/settings/name-form";
import { PasswordForm } from "@/components/settings/password-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Package, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function PengaturanPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: {
      nama: true,
      email: true,
      role: true,
      imageUrl: true,
      studentProfile: {
        select: {
          activeBorder: { select: { borderImageUrl: true, name: true } },
        },
      },
    },
  });

  if (!user) return null;

  const roleLabel =
    user.role === "ADMIN" ? "Admin" : user.role === "GURU" ? "Guru" : "Siswa";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <PageHeader
        title="Pengaturan Akun"
        description="Kelola nama, foto profil, dan keamanan akunmu"
      />

      <SettingsFlashAlert success={sp.success} error={sp.error} />

      <Card className="mb-6">
        <div className="mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <CardTitle>Profil</CardTitle>
        </div>
        <CardDescription className="mb-4">
          {user.email} · <Badge variant="primary">{roleLabel}</Badge>
        </CardDescription>
        <NameForm nama={user.nama} />
        <AvatarForm
          nama={user.nama}
          imageUrl={user.imageUrl}
          borderImageUrl={user.studentProfile?.activeBorder?.borderImageUrl}
        />
        {user.role === "SISWA" && (
          <Link href="/inventori" className="mt-4 inline-block">
            <Button variant="outline" size="sm">
              <Package className="h-4 w-4" />
              Kelola Border di Inventori
            </Button>
          </Link>
        )}
      </Card>

      <Card>
        <CardTitle className="mb-2">Keamanan</CardTitle>
        <CardDescription className="mb-4">
          Ganti password secara berkala untuk menjaga akunmu aman.
        </CardDescription>
        <PasswordForm />
      </Card>
    </div>
  );
}