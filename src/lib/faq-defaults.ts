import { z } from "zod";

export const faqRoleSchema = z.enum(["public", "siswa", "guru", "admin"]);

export const faqItemSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

export const faqCategorySchema = z.object({
  id: z.string().min(1),
  role: faqRoleSchema,
  title: z.string().min(1),
  items: z.array(faqItemSchema),
});

export const faqDataSchema = z.object({
  categories: z.array(faqCategorySchema),
});

export type FaqRole = z.infer<typeof faqRoleSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;
export type FaqCategory = z.infer<typeof faqCategorySchema>;
export type FaqData = z.infer<typeof faqDataSchema>;

export const DEFAULT_FAQ: FaqData = {
  categories: [
    {
      id: "umum",
      role: "public",
      title: "Umum",
      items: [
        {
          q: "Apa itu KREO?",
          a: "KREO adalah platform belajar gamifikasi untuk siswa SD. Siswa bisa mengikuti kelas, mengerjakan kuis, mengumpulkan EXP dan koin, serta mendapatkan lencana.",
        },
        {
          q: "Siapa yang bisa menggunakan KREO?",
          a: "Siswa, guru, dan admin sekolah dapat menggunakan KREO sesuai peran masing-masing.",
        },
        {
          q: "Apakah KREO gratis?",
          a: "Ya, KREO dapat digunakan gratis untuk mendukung pembelajaran di sekolah.",
        },
      ],
    },
    {
      id: "siswa",
      role: "siswa",
      title: "Untuk Siswa",
      items: [
        {
          q: "Bagaimana cara bergabung ke kelas?",
          a: "Masuk ke menu Kelas, pilih kelas yang tersedia, lalu klik Gabung Kelas.",
        },
        {
          q: "Bagaimana cara mendapatkan koin dan EXP?",
          a: "Selesaikan kuis di kelas yang Anda ikuti. Skor bagus memberikan hadiah EXP dan koin lebih banyak.",
        },
        {
          q: "Berapa kali saya bisa mengerjakan kuis?",
          a: "Anda dapat mengerjakan kuis hingga 3 kali per hari untuk setiap kuis.",
        },
        {
          q: "Apa itu lencana dan border?",
          a: "Lencana adalah penghargaan pencapaian yang tampil di papan peringkat. Border adalah dekorasi foto profil yang bisa dibeli di toko dengan koin.",
        },
      ],
    },
    {
      id: "guru",
      role: "guru",
      title: "Untuk Guru",
      items: [
        {
          q: "Bagaimana cara membuat kelas?",
          a: "Buka Kelas Saya, isi formulir Buat Kelas Baru, lalu tambahkan materi dan kuis di dalam kelas.",
        },
        {
          q: "Bagaimana cara melihat progress siswa?",
          a: "Gunakan menu Siswa & Progress atau Analitik Kuis untuk melihat skor, histogram, dan siswa yang belum lulus.",
        },
        {
          q: "Bisakah saya mengimpor soal dari bank soal?",
          a: "Ya, saat membuat kuis Anda dapat mengimpor soal dari Bank Soal SD yang sudah tersedia.",
        },
      ],
    },
    {
      id: "admin",
      role: "admin",
      title: "Untuk Admin",
      items: [
        {
          q: "Bagaimana cara menambah pengguna?",
          a: "Buka Manajemen Pengguna di dashboard admin, lalu gunakan formulir Tambah Pengguna Baru.",
        },
        {
          q: "Bagaimana cara mengubah konten homepage?",
          a: "Buka Kelola Homepage untuk mengedit hero, mini games, statistik, footer, dan FAQ.",
        },
        {
          q: "Bagaimana cara mengelola toko dan lencana?",
          a: "Gunakan menu Kelola Toko untuk border dan Kelola Lencana untuk badge pencapaian siswa.",
        },
      ],
    },
  ],
};

export function parseFaqJson(raw: string): FaqData {
  try {
    const parsed = JSON.parse(raw) as unknown;
    const result = faqDataSchema.safeParse(parsed);
    if (result.success) {
      return result.data.categories.length > 0 ? result.data : DEFAULT_FAQ;
    }
  } catch {
    // fall through
  }
  return DEFAULT_FAQ;
}

export function defaultFaqJsonString(): string {
  return JSON.stringify(DEFAULT_FAQ);
}