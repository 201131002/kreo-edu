"use server";

import { auth } from "@/lib/auth";
import { deleteBadgeImage, saveBadgeImage } from "@/lib/badge-storage";
import { validateAvatarFile } from "@/lib/image-validation";
import { prisma } from "@/lib/prisma";
import { badgeFormSchema, badgeIdSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard/admin?error=unauthorized");
  }
  return session;
}

function lencanaRedirect(query: string): never {
  redirect(`/admin/lencana?${query}`);
}

async function parseBadgeForm(formData: FormData) {
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || undefined;
  const file = formData.get("badgeImage");

  let resolvedImageUrl = imageUrl;

  if (file instanceof File && file.size > 0) {
    const validated = await validateAvatarFile(file);
    if (!validated.ok) return { ok: false as const };
    resolvedImageUrl = await saveBadgeImage(validated.data);
  }

  const parsed = badgeFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    criteria: formData.get("criteria"),
    criteriaValue: formData.get("criteriaValue"),
    imageUrl: resolvedImageUrl,
  });

  if (!parsed.success || !parsed.data.imageUrl) {
    return { ok: false as const };
  }

  return { ok: true as const, data: parsed.data };
}

export async function createBadgeAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const result = await parseBadgeForm(formData);
  if (!result.ok) lencanaRedirect("error=data-tidak-valid");

  const { name, description, criteria, criteriaValue, imageUrl } = result.data;

  const conflict = await prisma.badge.findUnique({
    where: { criteria_criteriaValue: { criteria, criteriaValue } },
  });
  if (conflict) lencanaRedirect("error=kriteria-sudah-ada");

  await prisma.badge.create({
    data: { name, description, criteria, criteriaValue, imageUrl: imageUrl! },
  });

  revalidatePath("/admin/lencana");
  revalidatePath("/inventori");
  revalidatePath("/peringkat");
  lencanaRedirect("success=lencana-ditambah");
}

export async function updateBadgeAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const idParsed = badgeIdSchema.safeParse({
    badgeId: formData.get("badgeId"),
  });
  if (!idParsed.success) lencanaRedirect("error=data-tidak-valid");

  const badge = await prisma.badge.findUnique({
    where: { id: idParsed.data.badgeId },
  });
  if (!badge) lencanaRedirect("error=lencana-tidak-ditemukan");

  const result = await parseBadgeForm(formData);
  if (!result.ok) lencanaRedirect("error=data-tidak-valid");

  const { name, description, criteria, criteriaValue, imageUrl } = result.data;

  const conflict = await prisma.badge.findFirst({
    where: {
      criteria,
      criteriaValue,
      NOT: { id: badge.id },
    },
  });
  if (conflict) lencanaRedirect("error=kriteria-sudah-ada");

  if (imageUrl !== badge.imageUrl) {
    await deleteBadgeImage(badge.imageUrl);
  }

  await prisma.badge.update({
    where: { id: badge.id },
    data: {
      name,
      description,
      criteria,
      criteriaValue,
      imageUrl: imageUrl!,
    },
  });

  revalidatePath("/admin/lencana");
  revalidatePath("/inventori");
  revalidatePath("/peringkat");
  lencanaRedirect("success=lencana-diubah");
}

export async function deleteBadgeAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = badgeIdSchema.safeParse({
    badgeId: formData.get("badgeId"),
  });
  if (!parsed.success) lencanaRedirect("error=data-tidak-valid");

  const badge = await prisma.badge.findUnique({
    where: { id: parsed.data.badgeId },
  });
  if (!badge) lencanaRedirect("error=lencana-tidak-ditemukan");

  await prisma.$transaction([
    prisma.studentProfile.updateMany({
      where: { activeBadgeId: badge.id },
      data: { activeBadgeId: null },
    }),
    prisma.badge.delete({ where: { id: badge.id } }),
  ]);

  await deleteBadgeImage(badge.imageUrl);

  revalidatePath("/admin/lencana");
  revalidatePath("/inventori");
  revalidatePath("/peringkat");
  lencanaRedirect("success=lencana-dihapus");
}