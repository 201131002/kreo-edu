import { DEFAULT_FAQ, defaultFaqJsonString } from "@/lib/faq-defaults";
import {
  DEFAULT_STUDENT_ONBOARDING,
  defaultStudentOnboardingJsonString,
} from "@/lib/student-onboarding-defaults";
import type { MiniGameSetting, SiteSettingsData, StatSetting } from "@/lib/site-settings-types";

export const DEFAULT_MINI_GAMES: MiniGameSetting[] = [
  {
    name: "History Heroes",
    description: "Jelajahi sejarah Indonesia lewat petualangan epik!",
    href: "/kelas/seed-kelas-history-heroes/materi",
    color: "from-amber-400 to-orange-500",
    icon: "History",
  },
  {
    name: "Language War",
    description: "Kuasai bahasa Indonesia dan Inggris dengan tantangan seru!",
    href: "/kelas/seed-kelas-language-war/materi",
    color: "from-violet-400 to-purple-500",
    icon: "Globe",
  },
  {
    name: "Questopia",
    description: "Petualangan terbuka penuh misi dan hadiah menarik!",
    href: "/kelas/seed-kelas-questopia/materi",
    color: "from-sky-400 to-blue-500",
    icon: "Rocket",
  },
  {
    name: "Math Master",
    description: "Jadi juara matematika dengan kuis interaktif!",
    href: "/kelas/seed-kelas-math-master/materi",
    color: "from-emerald-400 to-teal-500",
    icon: "Zap",
  },
];

export const DEFAULT_STATS: StatSetting[] = [
  { label: "Siswa Aktif", value: "10k+", icon: "Users" },
  { label: "Kuis Diselesaikan", value: "50k+", icon: "BookOpen" },
  { label: "Koin Terkumpul", value: "1M+", icon: "Coins" },
  { label: "Badge Diraih", value: "25k+", icon: "Trophy" },
];

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  siteName: "KREO",
  logoUrl: null,
  siteDescription:
    "Platform belajar gamifikasi untuk siswa SD. Kumpulkan EXP, koin, dan jadi juara!",
  heroBadge: "✨ Platform #1 untuk Siswa SD",
  heroTitle: "Belajar Jadi",
  heroTitleHighlight: "Petualangan Seru!",
  heroDescription:
    "KREO mengubah belajar menjadi game. Kumpulkan EXP, kumpulkan koin, dan jadi pahlawan pengetahuan bersama teman-temanmu!",
  heroCtaPrimary: "Mulai Petualangan",
  heroCtaSecondary: "Sudah Punya Akun",
  gamesTitle: "Mini Games Seru",
  gamesSubtitle: "Pilih petualangan favoritmu dan mulai belajar!",
  miniGames: DEFAULT_MINI_GAMES,
  stats: DEFAULT_STATS,
  faq: DEFAULT_FAQ,
  studentOnboarding: DEFAULT_STUDENT_ONBOARDING,
  ctaTitle: "Siap Jadi Pahlawan Pengetahuan?",
  ctaDescription:
    "Bergabung dengan ribuan siswa yang sudah belajar sambil bermain di KREO!",
  ctaButtonText: "Daftar Gratis Sekarang",
  footerTagline:
    "Platform belajar gamifikasi untuk siswa SD — belajar jadi petualangan seru!",
  footerCopyright: "© 2026 KREO. Untuk generasi penerus Indonesia.",
};

export function defaultSiteSettingsDbPayload() {
  const {
    miniGames: _miniGames,
    stats: _stats,
    faq: _faq,
    studentOnboarding: _studentOnboarding,
    ...rest
  } = DEFAULT_SITE_SETTINGS;

  return {
    id: "default" as const,
    ...rest,
    miniGamesJson: JSON.stringify(DEFAULT_MINI_GAMES),
    statsJson: JSON.stringify(DEFAULT_STATS),
    faqJson: defaultFaqJsonString(),
    studentOnboardingJson: defaultStudentOnboardingJsonString(),
  };
}