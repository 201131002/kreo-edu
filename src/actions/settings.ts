"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateAvatarFile } from "@/lib/image-validation";
import { deleteAvatarFile, saveAvatar } from "@/lib/avatar-storage";
import { changePasswordSchema, updateNameSchema } from "@/lib/validations";
import { unstable_update } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function settingsRedirect(query: string): never {
  redirect(`/pengaturan?${query}`);
}

export async function updateNameAction(
  formData: FormData
): Promise<{ error?: string } | void> {
  const session = await auth();
  if (!session) settingsRedirect("error=unauthorized");

  const parsed = updateNameSchema.safeParse({
    nama: formData.get("nama"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const { nama } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { nama: true },
  });

  if (!user) settingsRedirect("error=user-tidak-ditemukan");

  if (user.nama === nama) {
    return { error: "Nama sama dengan yang sekarang" };
  }

  await prisma.user.update({
    where: { id: session!.user.id },
    data: { nama },
  });

  await unstable_update({ user: { nama } });

  revalidatePath("/pengaturan");
  revalidatePath("/", "layout");
  revalidatePath("/dashboard", "layout");
  settingsRedirect("success=nama-diubah");
}

export async function changePasswordAction(
  formData: FormData
): Promise<{ error?: string } | void> {
  const session = await auth();
  if (!session) settingsRedirect("error=unauthorized");

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
  });

  if (!user) settingsRedirect("error=user-tidak-ditemukan");

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return { error: "Password lama salah" };
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  // Increment tokenVersion agar semua sesi JWT yang ada (termasuk yang dicuri)
  // tidak lagi valid setelah password diganti.
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, tokenVersion: { increment: 1 } },
  });

  settingsRedirect("success=password-diubah");
}

export async function uploadAvatarAction(
  formData: FormData
): Promise<{ error?: string } | void> {
  const session = await auth();
  if (!session) settingsRedirect("error=unauthorized");

  const file = formData.get("avatar");
  if (!(file instanceof File)) {
    return { error: "Pilih file gambar terlebih dahulu" };
  }

  const validated = await validateAvatarFile(file);
  if (!validated.ok) {
    return { error: validated.error };
  }

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { imageUrl: true },
  });

  if (!user) settingsRedirect("error=user-tidak-ditemukan");

  const newUrl = await saveAvatar(session!.user.id, validated.data);

  await prisma.user.update({
    where: { id: session!.user.id },
    data: { imageUrl: newUrl },
  });

  if (user.imageUrl) {
    await deleteAvatarFile(user.imageUrl);
  }

  revalidatePath("/pengaturan");
  revalidatePath("/", "layout");
  settingsRedirect("success=foto-diubah");
}

export async function removeAvatarAction(): Promise<void> {
  const session = await auth();
  if (!session) settingsRedirect("error=unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { imageUrl: true },
  });

  if (!user?.imageUrl) {
    settingsRedirect("error=tidak-ada-foto");
  }

  await deleteAvatarFile(user!.imageUrl!);
  await prisma.user.update({
    where: { id: session!.user.id },
    data: { imageUrl: null },
  });

  revalidatePath("/pengaturan");
  revalidatePath("/", "layout");
  settingsRedirect("success=foto-dihapus");
}