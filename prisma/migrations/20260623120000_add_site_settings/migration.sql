-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "siteName" TEXT NOT NULL DEFAULT 'KREO',
    "logoUrl" TEXT,
    "siteDescription" TEXT NOT NULL DEFAULT 'Platform belajar gamifikasi untuk siswa SD. Kumpulkan EXP, koin, dan jadi juara!',
    "heroBadge" TEXT NOT NULL DEFAULT '✨ Platform #1 untuk Siswa SD',
    "heroTitle" TEXT NOT NULL DEFAULT 'Belajar Jadi',
    "heroTitleHighlight" TEXT NOT NULL DEFAULT 'Petualangan Seru!',
    "heroDescription" TEXT NOT NULL DEFAULT 'KREO mengubah belajar menjadi game. Kumpulkan EXP, kumpulkan koin, dan jadi pahlawan pengetahuan bersama teman-temanmu!',
    "heroCtaPrimary" TEXT NOT NULL DEFAULT 'Mulai Petualangan',
    "heroCtaSecondary" TEXT NOT NULL DEFAULT 'Sudah Punya Akun',
    "gamesTitle" TEXT NOT NULL DEFAULT 'Mini Games Seru',
    "gamesSubtitle" TEXT NOT NULL DEFAULT 'Pilih petualangan favoritmu dan mulai belajar!',
    "miniGamesJson" TEXT NOT NULL,
    "statsJson" TEXT NOT NULL,
    "ctaTitle" TEXT NOT NULL DEFAULT 'Siap Jadi Pahlawan Pengetahuan?',
    "ctaDescription" TEXT NOT NULL DEFAULT 'Bergabung dengan ribuan siswa yang sudah belajar sambil bermain di KREO!',
    "ctaButtonText" TEXT NOT NULL DEFAULT 'Daftar Gratis Sekarang',
    "footerTagline" TEXT NOT NULL DEFAULT 'Platform belajar gamifikasi untuk siswa SD — belajar jadi petualangan seru!',
    "footerCopyright" TEXT NOT NULL DEFAULT '© 2026 KREO. Dibuat dengan ❤️ untuk generasi penerus.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);