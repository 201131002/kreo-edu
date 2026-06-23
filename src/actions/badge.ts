"use server";

import { auth } from "@/lib/auth";
import { syncEarnedBadges } from "@/lib/badge-service";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function inventoriRedirect(query: string): never {
  redirect(`/inventori?tab=lencana&${query}`);
}

async function requireStudentProfile() {
  const session = await auth();
  if (!session || session.user.role !== "SISWA") {
    redirect("/dashboard/siswa?error=unauthorized");
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) redirect("/dashboard/siswa?error=profil-tidak-ditemukan");

  await syncEarnedBadges(profile.id, session.user.id, profile.currentLevel);

  return { session, profile };
}

export async function equipBadgeAction(formData: FormData): Promise<void> {
  const { profile } = await requireStudentProfile();
  const badgeId = String(formData.get("badgeId") ?? "");
  if (!badgeId) inventoriRedirect("error=data-tidak-valid");

  const owned = await prisma.studentBadge.findUnique({
    where: {
      studentId_badgeId: { studentId: profile.id, badgeId },
    },
  });

  if (!owned) inventoriRedirect("error=lencana-tidak-dimiliki");

  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: { activeBadgeId: badgeId },
  });

  revalidatePath("/inventori");
  revalidatePath("/peringkat");
  inventoriRedirect("success=lencana-dipakai");
}

export async function unequipBadgeAction(): Promise<void> {
  const { profile } = await requireStudentProfile();

  if (!profile.activeBadgeId) {
    inventoriRedirect("error=tidak-ada-lencana-aktif");
  }

  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: { activeBadgeId: null },
  });

  revalidatePath("/inventori");
  revalidatePath("/peringkat");
  inventoriRedirect("success=lencana-dilepas");
}