"use server";

import { auth } from "@/lib/auth";
import { validateAvatarFile } from "@/lib/image-validation";
import { prisma } from "@/lib/prisma";
import { defaultSiteSettingsDbPayload } from "@/lib/site-settings-defaults";
import { deleteSiteLogo, saveSiteLogo } from "@/lib/site-storage";
import { siteSettingsSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function homepageRedirect(query: string): never {
  redirect(`/admin/homepage?${query}`);
}

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard/admin?error=unauthorized");
  }
  return session;
}

async function ensureSiteSettings() {
  const existing = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (existing) return existing;

  return prisma.siteSettings.create({ data: defaultSiteSettingsDbPayload() });
}

function parseMiniGamesFromForm(formData: FormData) {
  const games = [];
  for (let i = 0; i < 4; i++) {
    games.push({
      name: formData.get(`game_${i}_name`),
      description: formData.get(`game_${i}_description`),
      href: formData.get(`game_${i}_href`),
      color: formData.get(`game_${i}_color`),
      icon: formData.get(`game_${i}_icon`),
    });
  }
  return games;
}

function parseStatsFromForm(formData: FormData) {
  const stats = [];
  for (let i = 0; i < 4; i++) {
    stats.push({
      label: formData.get(`stat_${i}_label`),
      value: formData.get(`stat_${i}_value`),
      icon: formData.get(`stat_${i}_icon`),
    });
  }
  return stats;
}

export async function updateSiteSettingsAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = siteSettingsSchema.safeParse({
    siteName: formData.get("siteName"),
    siteDescription: formData.get("siteDescription"),
    heroBadge: formData.get("heroBadge"),
    heroTitle: formData.get("heroTitle"),
    heroTitleHighlight: formData.get("heroTitleHighlight"),
    heroDescription: formData.get("heroDescription"),
    heroCtaPrimary: formData.get("heroCtaPrimary"),
    heroCtaSecondary: formData.get("heroCtaSecondary"),
    gamesTitle: formData.get("gamesTitle"),
    gamesSubtitle: formData.get("gamesSubtitle"),
    miniGames: parseMiniGamesFromForm(formData),
    stats: parseStatsFromForm(formData),
    ctaTitle: formData.get("ctaTitle"),
    ctaDescription: formData.get("ctaDescription"),
    ctaButtonText: formData.get("ctaButtonText"),
    footerTagline: formData.get("footerTagline"),
    footerCopyright: formData.get("footerCopyright"),
  });

  if (!parsed.success) {
    homepageRedirect("error=data-tidak-valid");
  }

  const data = parsed.data;
  await ensureSiteSettings();

  await prisma.siteSettings.update({
    where: { id: "default" },
    data: {
      siteName: data.siteName,
      siteDescription: data.siteDescription,
      heroBadge: data.heroBadge,
      heroTitle: data.heroTitle,
      heroTitleHighlight: data.heroTitleHighlight,
      heroDescription: data.heroDescription,
      heroCtaPrimary: data.heroCtaPrimary,
      heroCtaSecondary: data.heroCtaSecondary,
      gamesTitle: data.gamesTitle,
      gamesSubtitle: data.gamesSubtitle,
      miniGamesJson: JSON.stringify(data.miniGames),
      statsJson: JSON.stringify(data.stats),
      ctaTitle: data.ctaTitle,
      ctaDescription: data.ctaDescription,
      ctaButtonText: data.ctaButtonText,
      footerTagline: data.footerTagline,
      footerCopyright: data.footerCopyright,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/homepage");
  revalidatePath("/", "layout");
  homepageRedirect("success=homepage-disimpan");
}

export async function uploadSiteLogoAction(
  formData: FormData
): Promise<{ error?: string } | void> {
  await requireAdmin();

  const file = formData.get("logo");
  if (!(file instanceof File)) {
    return { error: "Pilih file logo terlebih dahulu" };
  }

  const validated = await validateAvatarFile(file);
  if (!validated.ok) {
    return { error: validated.error };
  }

  const settings = await ensureSiteSettings();
  const newUrl = await saveSiteLogo(validated.data);

  await prisma.siteSettings.update({
    where: { id: "default" },
    data: { logoUrl: newUrl },
  });

  if (settings.logoUrl) {
    await deleteSiteLogo(settings.logoUrl);
  }

  revalidatePath("/");
  revalidatePath("/admin/homepage");
  revalidatePath("/", "layout");
  homepageRedirect("success=logo-diubah");
}

export async function removeSiteLogoAction(): Promise<void> {
  await requireAdmin();

  const settings = await ensureSiteSettings();
  if (!settings.logoUrl) {
    homepageRedirect("error=tidak-ada-logo");
  }

  await deleteSiteLogo(settings.logoUrl!);
  await prisma.siteSettings.update({
    where: { id: "default" },
    data: { logoUrl: null },
  });

  revalidatePath("/");
  revalidatePath("/admin/homepage");
  revalidatePath("/", "layout");
  homepageRedirect("success=logo-dihapus");
}