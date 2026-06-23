"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  adminCreateUserSchema,
  adminUpdateRoleSchema,
  adminUserIdSchema,
} from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { UserRole } from "@/generated/prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard/admin?error=unauthorized");
  }
  return session;
}

async function countAdmins() {
  return prisma.user.count({ where: { role: "ADMIN" } });
}

async function ensureStudentProfile(userId: string) {
  const existing = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!existing) {
    await prisma.studentProfile.create({ data: { userId } });
  }
}

export async function createUserAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = adminCreateUserSchema.safeParse({
    nama: formData.get("nama"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    redirect("/admin/pengguna?error=data-tidak-valid");
  }

  const { nama, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/admin/pengguna?error=email-sudah-ada");
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      nama,
      email,
      password: hashed,
      role,
      ...(role === "SISWA" ? { studentProfile: { create: {} } } : {}),
    },
  });

  revalidatePath("/admin/pengguna");
  revalidatePath("/admin/analitik");
  redirect("/admin/pengguna?success=user-dibuat");
}

export async function updateUserRoleAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();

  const parsed = adminUpdateRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    redirect("/admin/pengguna?error=data-tidak-valid");
  }

  const { userId, role } = parsed.data;

  if (userId === session.user.id) {
    redirect("/admin/pengguna?error=tidak-bisa-edit-diri");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    redirect("/admin/pengguna?error=user-tidak-ditemukan");
  }

  if (user.role === "ADMIN" && role !== "ADMIN") {
    const admins = await countAdmins();
    if (admins <= 1) {
      redirect("/admin/pengguna?error=admin-terakhir");
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: role as UserRole },
  });

  if (role === "SISWA") {
    await ensureStudentProfile(userId);
  }

  revalidatePath("/admin/pengguna");
  redirect("/admin/pengguna?success=role-diubah");
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();

  const parsed = adminUserIdSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    redirect("/admin/pengguna?error=data-tidak-valid");
  }

  const { userId } = parsed.data;

  if (userId === session.user.id) {
    redirect("/admin/pengguna?error=tidak-bisa-edit-diri");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { _count: { select: { classes: true } } },
  });

  if (!user) {
    redirect("/admin/pengguna?error=user-tidak-ditemukan");
  }

  if (user.role === "ADMIN") {
    const admins = await countAdmins();
    if (admins <= 1) {
      redirect("/admin/pengguna?error=admin-terakhir");
    }
  }

  if (user._count.classes > 0) {
    redirect("/admin/pengguna?error=guru-punya-kelas");
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/pengguna");
  revalidatePath("/admin/analitik");
  redirect("/admin/pengguna?success=user-dihapus");
}

export async function resetStudentProgressAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = adminUserIdSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    redirect("/admin/pengguna?error=data-tidak-valid");
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    include: { studentProfile: true },
  });

  if (!user || user.role !== "SISWA" || !user.studentProfile) {
    redirect("/admin/pengguna?error=user-tidak-ditemukan");
  }

  await prisma.$transaction([
    prisma.studentInventory.deleteMany({
      where: { studentId: user.studentProfile.id },
    }),
    prisma.quizAttempt.deleteMany({ where: { studentId: user.id } }),
    prisma.studentProfile.update({
      where: { id: user.studentProfile.id },
      data: {
        currentLevel: 1,
        currentExp: 0,
        virtualCurrency: 0,
        activeBorderId: null,
      },
    }),
  ]);

  revalidatePath("/admin/pengguna");
  redirect("/admin/pengguna?success=progress-direset");
}