import { z } from "zod";
import { faqDataSchema, type FaqData } from "@/lib/faq-defaults";
import {
  studentOnboardingSchema,
  type StudentOnboardingData,
} from "@/lib/student-onboarding-defaults";

export const miniGameIconSchema = z.enum([
  "History",
  "Globe",
  "Rocket",
  "Zap",
  "BookOpen",
  "Gamepad2",
]);

export const statIconSchema = z.enum(["Users", "BookOpen", "Coins", "Trophy"]);

export const miniGameSettingSchema = z.object({
  name: z.string().min(1, "Nama game wajib diisi"),
  description: z.string().min(1, "Deskripsi game wajib diisi"),
  href: z.string().min(1, "Link game wajib diisi"),
  color: z.string().min(1, "Warna gradient wajib diisi"),
  icon: miniGameIconSchema,
});

export const statSettingSchema = z.object({
  label: z.string().min(1, "Label statistik wajib diisi"),
  value: z.string().min(1, "Nilai statistik wajib diisi"),
  icon: statIconSchema,
});

export type MiniGameSetting = z.infer<typeof miniGameSettingSchema>;
export type StatSetting = z.infer<typeof statSettingSchema>;

export { faqDataSchema, studentOnboardingSchema };
export type { FaqData, StudentOnboardingData };

export type SiteSettingsData = {
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
  miniGames: MiniGameSetting[];
  stats: StatSetting[];
  faq: FaqData;
  studentOnboarding: StudentOnboardingData;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  footerTagline: string;
  footerCopyright: string;
};