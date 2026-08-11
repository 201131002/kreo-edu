import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { createPgPool } from "../src/lib/db-pool";
import { defaultSiteSettingsDbPayload } from "../src/lib/site-settings-defaults";
import { calculateLevel } from "../src/lib/utils";
import { MINI_GAMES, type SeedMiniGame } from "./mini-games-data";
import { QUESTION_BANK_DATA } from "./question-bank-data";
import { SHOP_BORDERS } from "./shop-borders-data";

const pool = createPgPool();
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function seedMiniGame(
  teacherId: string,
  studentIds: string[],
  game: SeedMiniGame
) {
  await prisma.class.upsert({
    where: { id: game.classId },
    create: {
      id: game.classId,
      title: game.title,
      description: game.description,
      teacherId,
    },
    update: {
      title: game.title,
      description: game.description,
      teacherId,
    },
  });

  for (const studentId of studentIds) {
    await prisma.classEnrollment.upsert({
      where: {
        classId_studentId: { classId: game.classId, studentId },
      },
      create: { classId: game.classId, studentId },
      update: {},
    });
  }

  await prisma.material.upsert({
    where: { id: game.materialId },
    create: {
      id: game.materialId,
      classId: game.classId,
      title: game.materialTitle,
      content: game.materialContent,
    },
    update: {
      title: game.materialTitle,
      content: game.materialContent,
    },
  });

  await prisma.quiz.upsert({
    where: { id: game.quizId },
    create: {
      id: game.quizId,
      classId: game.classId,
      title: game.quizTitle,
      rewardCoins: game.rewardCoins,
      rewardExp: game.rewardExp,
    },
    update: {
      title: game.quizTitle,
      rewardCoins: game.rewardCoins,
      rewardExp: game.rewardExp,
    },
  });

  for (const question of game.questions) {
    const { id, ...rest } = question;
    await prisma.question.upsert({
      where: { id },
      create: { id, quizId: game.quizId, ...rest },
      update: rest,
    });
  }
}

async function seedShopItems() {
  for (const border of SHOP_BORDERS) {
    const existing = await prisma.shopItem.findFirst({
      where: { borderImageUrl: border.borderImageUrl },
    });
    if (existing) {
      await prisma.shopItem.update({
        where: { id: existing.id },
        data: { name: border.name, priceCoins: border.priceCoins },
      });
    } else {
      await prisma.shopItem.create({ data: border });
    }
  }
}

async function seedQuestionBank() {
  for (const item of QUESTION_BANK_DATA) {
    const { id, ...rest } = item;
    await prisma.questionBankItem.upsert({
      where: { id },
      create: { id, ...rest },
      update: rest,
    });
  }
}

async function seedBadges() {
  const badges = [
    {
      id: "badge-level-1",
      name: "Pemula",
      description: "Capai level 1",
      imageUrl: "/badges/lencana-pemula.svg",
      criteria: "LEVEL" as const,
      criteriaValue: 1,
    },
    {
      id: "badge-level-5",
      name: "Penjelajah",
      description: "Capai level 5",
      imageUrl: "/badges/lencana-penjelajah.svg",
      criteria: "LEVEL" as const,
      criteriaValue: 5,
    },
    {
      id: "badge-level-10",
      name: "Pahlawan",
      description: "Capai level 10",
      imageUrl: "/badges/lencana-pahlawan.svg",
      criteria: "LEVEL" as const,
      criteriaValue: 10,
    },
    {
      id: "badge-first-quiz",
      name: "Perdana",
      description: "Selesaikan kuis pertamamu",
      imageUrl: "/badges/lencana-perdana.svg",
      criteria: "FIRST_QUIZ" as const,
      criteriaValue: 0,
    },
    {
      id: "badge-quiz-1",
      name: "Penguji",
      description: "Selesaikan 1 kuis",
      imageUrl: "/badges/lencana-kuis-1.svg",
      criteria: "QUIZ_COUNT" as const,
      criteriaValue: 1,
    },
    {
      id: "badge-quiz-5",
      name: "Pejuang Kuis",
      description: "Selesaikan 5 kuis",
      imageUrl: "/badges/lencana-kuis-5.svg",
      criteria: "QUIZ_COUNT" as const,
      criteriaValue: 5,
    },
    {
      id: "badge-quiz-10",
      name: "Master Kuis",
      description: "Selesaikan 10 kuis",
      imageUrl: "/badges/lencana-kuis-10.svg",
      criteria: "QUIZ_COUNT" as const,
      criteriaValue: 10,
    },
  ];

  for (const badge of badges) {
    const { id, criteria, criteriaValue, ...rest } = badge;
    await prisma.badge.upsert({
      where: { criteria_criteriaValue: { criteria, criteriaValue } },
      create: { id, criteria, criteriaValue, ...rest },
      update: rest,
    });
  }
}

async function seedDiscussionMessages(users: {
  adminId: string;
  guruId: string;
  siswaId: string;
  aniId: string;
}) {
  const messages = [
    {
      id: "seed-msg-1",
      classId: "seed-kelas-history-heroes",
      senderId: users.guruId,
      content:
        "Selamat datang di History Heroes! Selesaikan materi lalu coba kuis 10 soalnya ya! 🏛️",
    },
    {
      id: "seed-msg-2",
      classId: "seed-kelas-history-heroes",
      senderId: users.aniId,
      content: "Wah seru! Aku sudah hafal tanggal proklamasi nih 😄",
    },
    {
      id: "seed-msg-3",
      classId: "seed-kelas-history-heroes",
      senderId: users.siswaId,
      content: "Aku baru selesai materinya, siap kuis nih!",
    },
    {
      id: "seed-msg-4",
      classId: "seed-kelas-questopia",
      senderId: users.adminId,
      content: "Event weekend: double EXP untuk semua kuis Questopia! 🚀",
    },
    {
      id: "seed-msg-5",
      classId: "seed-kelas-questopia",
      senderId: users.guruId,
      content: "Yuk jelajahi misi Questopia bareng-bareng, banyak hadiah menanti!",
    },
  ];

  for (const message of messages) {
    const { id, ...rest } = message;
    await prisma.discussionMessage.upsert({
      where: { id },
      create: { id, ...rest },
      update: rest,
    });
  }
}

async function main() {
  console.log("🌱 Seeding KREO database...\n");

  const passwordHash = await bcrypt.hash("kreo123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@kreo.id" },
    create: {
      email: "admin@kreo.id",
      nama: "Admin KREO",
      password: passwordHash,
      role: "ADMIN",
    },
    update: {
      nama: "Admin KREO",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  const guru = await prisma.user.upsert({
    where: { email: "guru@kreo.id" },
    create: {
      email: "guru@kreo.id",
      nama: "Bu Sari",
      password: passwordHash,
      role: "GURU",
    },
    update: {
      nama: "Bu Sari",
      password: passwordHash,
      role: "GURU",
    },
  });

  const siswa = await prisma.user.upsert({
    where: { email: "siswa@kreo.id" },
    create: {
      email: "siswa@kreo.id",
      nama: "Budi Santoso",
      password: passwordHash,
      role: "SISWA",
    },
    update: {
      nama: "Budi Santoso",
      password: passwordHash,
      role: "SISWA",
    },
  });

  const ani = await prisma.user.upsert({
    where: { email: "ani@kreo.id" },
    create: {
      email: "ani@kreo.id",
      nama: "Ani Wijaya",
      password: passwordHash,
      role: "SISWA",
    },
    update: {
      nama: "Ani Wijaya",
      password: passwordHash,
      role: "SISWA",
    },
  });

  const doni = await prisma.user.upsert({
    where: { email: "doni@kreo.id" },
    create: {
      email: "doni@kreo.id",
      nama: "Doni Pratama",
      password: passwordHash,
      role: "SISWA",
    },
    update: {
      nama: "Doni Pratama",
      password: passwordHash,
      role: "SISWA",
    },
  });

  const studentProfiles = [
    { userId: siswa.id, currentExp: 50, virtualCurrency: 20 },
    { userId: ani.id, currentExp: 320, virtualCurrency: 150 },
    { userId: doni.id, currentExp: 180, virtualCurrency: 80 },
  ];

  for (const profile of studentProfiles) {
    const currentLevel = calculateLevel(profile.currentExp);
    await prisma.studentProfile.upsert({
      where: { userId: profile.userId },
      create: {
        userId: profile.userId,
        currentExp: profile.currentExp,
        currentLevel,
        virtualCurrency: profile.virtualCurrency,
      },
      update: {
        currentExp: profile.currentExp,
        currentLevel,
        virtualCurrency: profile.virtualCurrency,
      },
    });
  }

  const studentIds = [siswa.id, ani.id, doni.id];

  for (const game of MINI_GAMES) {
    await seedMiniGame(guru.id, studentIds, game);
    console.log(`  ✓ Mini game: ${game.title}`);
  }

  await seedDiscussionMessages({
    adminId: admin.id,
    guruId: guru.id,
    siswaId: siswa.id,
    aniId: ani.id,
  });
  console.log("  ✓ Discussion messages");

  await seedShopItems();
  console.log(`  ✓ Shop borders (${SHOP_BORDERS.length} item)`);

  await seedQuestionBank();
  console.log(`  ✓ Question bank (${QUESTION_BANK_DATA.length} soal)`);

  await seedBadges();
  console.log("  ✓ Badges");

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: defaultSiteSettingsDbPayload(),
    update: defaultSiteSettingsDbPayload(),
  });
  console.log("  ✓ Site settings");

  console.log("\n✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });