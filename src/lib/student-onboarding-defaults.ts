import { z } from "zod";

export const onboardingStepIconSchema = z.enum([
  "BookOpen",
  "FileText",
  "ClipboardList",
  "ShoppingBag",
  "Package",
  "Medal",
  "Trophy",
  "Star",
  "Coins",
]);

export const studentOnboardingStepSchema = z.object({
  order: z.number().int().min(1).max(20),
  title: z.string().min(1),
  description: z.string().min(1),
  href: z.string().min(1),
  icon: onboardingStepIconSchema,
});

export const studentOnboardingSchema = z.object({
  enabled: z.boolean(),
  title: z.string().min(1),
  description: z.string().min(1),
  dismissLabel: z.string().min(1),
  steps: z.array(studentOnboardingStepSchema).min(1).max(12),
});

export type StudentOnboardingStep = z.infer<typeof studentOnboardingStepSchema>;
export type StudentOnboardingData = z.infer<typeof studentOnboardingSchema>;

export const DEFAULT_STUDENT_ONBOARDING: StudentOnboardingData = {
  enabled: true,
  title: "Selamat datang di KREO! 🎮",
  description:
    "Ikuti urutan inti ini setelah login: gabung kelas → baca materi → kerjakan kuis → belanja koin di toko → kelola inventori → cek peringkat → lihat laporan petualangan.",
  dismissLabel: "Mengerti, mulai petualangan!",
  steps: [
    {
      order: 1,
      title: "Gabung Kelas",
      description: "Buka menu Kelas, pilih petualangan favoritmu, lalu klik Gabung Kelas.",
      href: "/kelas",
      icon: "BookOpen",
    },
    {
      order: 2,
      title: "Baca Materi",
      description: "Masuk ke kelas yang sudah diikuti dan pelajari materi dari guru.",
      href: "/kelas",
      icon: "FileText",
    },
    {
      order: 3,
      title: "Kerjakan Kuis",
      description: "Uji pemahamanmu lewat kuis. Skor bagus memberi EXP dan koin!",
      href: "/kelas",
      icon: "ClipboardList",
    },
    {
      order: 4,
      title: "Belanja di Toko",
      description: "Gunakan koin virtual untuk membeli border dan item keren di toko.",
      href: "/toko",
      icon: "ShoppingBag",
    },
    {
      order: 5,
      title: "Inventori",
      description: "Lihat dan pakai item yang sudah kamu beli dari toko.",
      href: "/inventori",
      icon: "Package",
    },
    {
      order: 6,
      title: "Peringkat",
      description: "Bandingkan pencapaianmu dengan siswa lain di papan peringkat.",
      href: "/peringkat",
      icon: "Medal",
    },
    {
      order: 7,
      title: "Laporan Petualangan",
      description: "Cek riwayat kuis, skor, dan detail jawaban di laporan petualangan.",
      href: "/laporan",
      icon: "Trophy",
    },
  ],
};

export function parseStudentOnboardingJson(raw: string): StudentOnboardingData {
  try {
    const parsed = JSON.parse(raw) as unknown;
    const result = studentOnboardingSchema.safeParse(parsed);
    if (result.success) {
      return {
        ...result.data,
        steps: [...result.data.steps].sort((a, b) => a.order - b.order),
      };
    }
  } catch {
    // fall through
  }
  return DEFAULT_STUDENT_ONBOARDING;
}

export function defaultStudentOnboardingJsonString(): string {
  return JSON.stringify(DEFAULT_STUDENT_ONBOARDING);
}