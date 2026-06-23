import { z } from "zod";
import {
  miniGameSettingSchema,
  statSettingSchema,
} from "@/lib/site-settings-types";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["SISWA", "GURU", "ADMIN"]),
});

export const registerSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["SISWA", "GURU"], {
    message: "Hanya siswa dan guru yang dapat mendaftar",
  }),
});

export const classSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().optional(),
});

export const materialSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  content: z.string().optional(),
  classId: z.string(),
});

export const quizSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  classId: z.string(),
  rewardCoins: z.coerce.number().min(0).max(1000),
  rewardExp: z.coerce.number().min(0).max(5000),
});

export const questionSchema = z.object({
  questionText: z.string().min(5),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  optionD: z.string().min(1),
  correctOption: z.enum(["A", "B", "C", "D"]),
  quizId: z.string(),
});

export const updateClassSchema = classSchema.extend({
  classId: z.string().min(1),
});

export const classIdSchema = z.object({
  classId: z.string().min(1),
});

export const updateMaterialSchema = materialSchema.extend({
  materialId: z.string().min(1),
});

export const materialIdSchema = z.object({
  materialId: z.string().min(1),
  classId: z.string().min(1),
});

export const updateQuizSchema = quizSchema.extend({
  quizId: z.string().min(1),
});

export const quizIdSchema = z.object({
  quizId: z.string().min(1),
  classId: z.string().min(1),
});

export const updateQuestionSchema = questionSchema.extend({
  questionId: z.string().min(1),
  classId: z.string().min(1),
});

export const questionIdSchema = z.object({
  questionId: z.string().min(1),
  quizId: z.string().min(1),
  classId: z.string().min(1),
});

export const quizSubmitSchema = z.object({
  quizId: z.string(),
  answers: z.record(z.string(), z.enum(["A", "B", "C", "D"])),
});

export const adminCreateUserSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["SISWA", "GURU", "ADMIN"]),
});

export const adminUpdateRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(["SISWA", "GURU", "ADMIN"]),
});

export const adminUserIdSchema = z.object({
  userId: z.string(),
});

export const discussionMessageSchema = z.object({
  classId: z.string(),
  content: z
    .string()
    .min(1, "Pesan tidak boleh kosong")
    .max(500, "Pesan maksimal 500 karakter"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: z
      .string()
      .min(6, "Password baru minimal 6 karakter")
      .max(128, "Password terlalu panjang"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const scheduleDayEntrySchema = z.object({
  day: z.enum([
    "SENIN",
    "SELASA",
    "RABU",
    "KAMIS",
    "JUMAT",
    "SABTU",
    "MINGGU",
  ]),
  subject: z.string().max(120),
  startTime: z.string().regex(timePattern, "Format waktu: HH:MM"),
  endTime: z.string().regex(timePattern, "Format waktu: HH:MM"),
  color: z.enum(["primary", "secondary", "tertiary"]),
});

export const saveScheduleSchema = z.object({
  classId: z.string().min(1),
  entries: z.array(scheduleDayEntrySchema),
});

export const badgeFormSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(60),
  description: z.string().max(200).optional(),
  criteria: z.enum(["LEVEL", "QUIZ_COUNT", "FIRST_QUIZ"]),
  criteriaValue: z.coerce.number().min(0).max(9999),
  imageUrl: z.string().min(1).optional(),
});

export const badgeIdSchema = z.object({
  badgeId: z.string().min(1),
});

export const siteSettingsSchema = z.object({
  siteName: z.string().min(1, "Nama situs wajib diisi").max(50),
  siteDescription: z.string().min(10, "Deskripsi minimal 10 karakter").max(300),
  heroBadge: z.string().min(1).max(80),
  heroTitle: z.string().min(1).max(80),
  heroTitleHighlight: z.string().min(1).max(80),
  heroDescription: z.string().min(10).max(500),
  heroCtaPrimary: z.string().min(1).max(40),
  heroCtaSecondary: z.string().min(1).max(40),
  gamesTitle: z.string().min(1).max(80),
  gamesSubtitle: z.string().min(1).max(200),
  miniGames: z.array(miniGameSettingSchema).min(1).max(8),
  stats: z.array(statSettingSchema).min(1).max(8),
  ctaTitle: z.string().min(1).max(120),
  ctaDescription: z.string().min(1).max(300),
  ctaButtonText: z.string().min(1).max(40),
  footerTagline: z.string().min(1).max(200),
  footerCopyright: z.string().min(1).max(120),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;