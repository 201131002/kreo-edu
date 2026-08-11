import { unstable_cache } from "next/cache";
import { parseFaqJson } from "@/lib/faq-defaults";
import { parseStudentOnboardingJson } from "@/lib/student-onboarding-defaults";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_MINI_GAMES,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_STATS,
} from "@/lib/site-settings-defaults";
import {
  miniGameSettingSchema,
  statSettingSchema,
  type SiteSettingsData,
} from "@/lib/site-settings-types";

function padItems<T>(items: T[], fallback: T[], count: number): T[] {
  const result = [...items];
  while (result.length < count) {
    result.push(fallback[result.length] ?? fallback[0]);
  }
  return result.slice(0, count);
}

function parseJsonArray<T>(
  raw: string,
  schema: { safeParse: (value: unknown) => { success: boolean; data?: T } },
  fallback: T[]
): T[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return fallback;
    const items: T[] = [];
    for (const item of parsed) {
      const result = schema.safeParse(item);
      if (result.success && result.data) {
        items.push(result.data);
      }
    }
    return items.length > 0 ? items : fallback;
  } catch {
    return fallback;
  }
}

function mapRowToSettings(row: {
  siteName: string;
  logoUrl: string | null;
  siteDescription: string;
  heroBadge: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroDescription: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  gamesTitle: string;
  gamesSubtitle: string;
  miniGamesJson: string;
  statsJson: string;
  faqJson: string;
  studentOnboardingJson: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  footerTagline: string;
  footerCopyright: string;
}): SiteSettingsData {
  return {
    siteName: row.siteName,
    logoUrl: row.logoUrl,
    siteDescription: row.siteDescription,
    heroBadge: row.heroBadge,
    heroTitle: row.heroTitle,
    heroTitleHighlight: row.heroTitleHighlight,
    heroDescription: row.heroDescription,
    heroCtaPrimary: row.heroCtaPrimary,
    heroCtaSecondary: row.heroCtaSecondary,
    gamesTitle: row.gamesTitle,
    gamesSubtitle: row.gamesSubtitle,
    miniGames: padItems(
      parseJsonArray(row.miniGamesJson, miniGameSettingSchema, DEFAULT_MINI_GAMES),
      DEFAULT_MINI_GAMES,
      4
    ),
    stats: padItems(
      parseJsonArray(row.statsJson, statSettingSchema, DEFAULT_STATS),
      DEFAULT_STATS,
      4
    ),
    faq: parseFaqJson(row.faqJson),
    studentOnboarding: parseStudentOnboardingJson(row.studentOnboardingJson),
    ctaTitle: row.ctaTitle,
    ctaDescription: row.ctaDescription,
    ctaButtonText: row.ctaButtonText,
    footerTagline: row.footerTagline,
    footerCopyright: row.footerCopyright,
  };
}

export const SITE_SETTINGS_CACHE_TAG = "site-settings";

async function fetchSiteSettingsFromDb(): Promise<SiteSettingsData> {
  const row = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (!row) return DEFAULT_SITE_SETTINGS;
  return mapRowToSettings(row);
}

const getCachedSiteSettings = unstable_cache(
  fetchSiteSettingsFromDb,
  ["site-settings"],
  { tags: [SITE_SETTINGS_CACHE_TAG], revalidate: 3600 }
);

export async function getSiteSettings(): Promise<SiteSettingsData> {
  return getCachedSiteSettings();
}