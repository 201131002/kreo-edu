"use server";

import { auth } from "@/lib/auth";
import { validateAvatarFile } from "@/lib/image-validation";
import { deleteBorderImage, saveBorderImage } from "@/lib/border-storage";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard/admin?error=unauthorized");
  }
  return session;
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
  return { session, profile };
}

function shopRedirect(path: string, query: string): never {
  redirect(`${path}?${query}`);
}

export async function purchaseItemAction(formData: FormData): Promise<void> {
  const { profile } = await requireStudentProfile();

  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) return;

  const item = await prisma.shopItem.findUnique({ where: { id: itemId } });
  if (!item) return;

  const owned = await prisma.studentInventory.findUnique({
    where: {
      studentId_itemId: { studentId: profile.id, itemId },
    },
  });

  if (owned) shopRedirect("/toko", "info=item-sudah-dimiliki");

  try {
    await prisma.$transaction(async (tx) => {
      const deducted = await tx.studentProfile.updateMany({
        where: { id: profile.id, virtualCurrency: { gte: item.priceCoins } },
        data: { virtualCurrency: { decrement: item.priceCoins } },
      });

      if (deducted.count !== 1) {
        // Saldo tidak cukup atau race condition — beri feedback ke user
        shopRedirect("/toko", "error=saldo-tidak-cukup");
      }

      await tx.studentInventory.create({
        data: { studentId: profile.id, itemId },
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return;
    }
    throw error;
  }

  revalidatePath("/toko");
  revalidatePath("/inventori");
  revalidatePath("/dashboard/siswa");
}

export async function equipBorderAction(formData: FormData): Promise<void> {
  const { profile } = await requireStudentProfile();
  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) shopRedirect("/inventori", "error=data-tidak-valid");

  const owned = await prisma.studentInventory.findUnique({
    where: {
      studentId_itemId: { studentId: profile.id, itemId },
    },
    include: { item: true },
  });

  if (!owned) shopRedirect("/inventori", "error=border-tidak-dimiliki");

  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: { activeBorderId: itemId },
  });

  revalidatePath("/inventori");
  revalidatePath("/toko");
  revalidatePath("/dashboard/siswa");
  revalidatePath("/pengaturan");
  revalidatePath("/peringkat");
  revalidatePath("/", "layout");
  shopRedirect("/inventori", "success=border-dipakai");
}

export async function unequipBorderAction(): Promise<void> {
  const { profile } = await requireStudentProfile();

  if (!profile.activeBorderId) {
    shopRedirect("/inventori", "error=tidak-ada-border-aktif");
  }

  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: { activeBorderId: null },
  });

  revalidatePath("/inventori");
  revalidatePath("/toko");
  revalidatePath("/dashboard/siswa");
  revalidatePath("/pengaturan");
  revalidatePath("/peringkat");
  revalidatePath("/", "layout");
  shopRedirect("/inventori", "success=border-dilepas");
}

export async function createShopItemAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const priceCoins = Number(formData.get("priceCoins"));
  const file = formData.get("borderImage");

  if (!name || priceCoins < 0 || !(file instanceof File) || file.size === 0) {
    shopRedirect("/admin/toko", "error=data-tidak-valid");
  }

  const validated = await validateAvatarFile(file);
  if (!validated.ok) {
    shopRedirect("/admin/toko", "error=border-tidak-valid");
  }

  const borderImageUrl = await saveBorderImage(validated.data);

  await prisma.shopItem.create({
    data: { name, priceCoins, borderImageUrl },
  });

  revalidatePath("/admin/toko");
  revalidatePath("/toko");
  shopRedirect("/admin/toko", "success=item-ditambah");
}