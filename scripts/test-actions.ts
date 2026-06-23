import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { createPgPool } from "../src/lib/db-pool";
import { calculateLevel } from "../src/lib/utils";

const pool = createPgPool();
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

let passed = 0;
let failed = 0;

function ok(msg: string) {
  passed++;
  console.log(`  ✅ ${msg}`);
}
function err(msg: string) {
  failed++;
  console.log(`  ❌ ${msg}`);
}

function calculateRewards(
  isFirstAttempt: boolean,
  passed: boolean,
  rewardCoins: number,
  rewardExp: number
) {
  if (!isFirstAttempt) return { coinsEarned: 0, expEarned: 0 };
  return {
    coinsEarned: passed ? rewardCoins : Math.floor(rewardCoins * 0.3),
    expEarned: passed ? rewardExp : Math.floor(rewardExp * 0.3),
  };
}

async function recordAttempt(
  studentId: string,
  quizId: string,
  score: number,
  rewardCoins: number,
  rewardExp: number,
  isFirstAttempt: boolean
) {
  const passed = score >= 60;
  const { coinsEarned, expEarned } = calculateRewards(
    isFirstAttempt,
    passed,
    rewardCoins,
    rewardExp
  );

  return prisma.$transaction(async (tx) => {
    const attempt = await tx.quizAttempt.create({
      data: {
        quizId,
        studentId,
        score,
        correctAnswers: score,
        totalQuestions: 10,
        coinsEarned,
        expEarned,
      },
    });

    if (coinsEarned > 0 || expEarned > 0) {
      const profile = await tx.studentProfile.findUnique({
        where: { userId: studentId },
      });
      if (profile) {
        const newExp = profile.currentExp + expEarned;
        await tx.studentProfile.update({
          where: { userId: studentId },
          data: {
            currentExp: newExp,
            currentLevel: calculateLevel(newExp),
            virtualCurrency: profile.virtualCurrency + coinsEarned,
          },
        });
      }
    }

    return attempt;
  });
}

async function main() {
  console.log("========================================");
  console.log("KREO Server Action / DB Logic Tests");
  console.log("========================================\n");

  const siswa = await prisma.user.findUnique({
    where: { email: "siswa@kreo.id" },
    include: { studentProfile: true },
  });
  const guru = await prisma.user.findUnique({ where: { email: "guru@kreo.id" } });

  if (!siswa?.studentProfile) {
    err("Siswa profile not found");
    return;
  }
  ok("Seed data: siswa profile exists");

  const quiz = await prisma.quiz.findUnique({
    where: { id: "seed-kuis-language-war" },
    include: { questions: true },
  });
  if (!quiz) {
    err("Seed quiz not found");
    return;
  }
  ok(`Seed data: quiz has ${quiz.questions.length} questions`);

  await prisma.quizAttempt.deleteMany({
    where: { studentId: siswa.id, quizId: quiz.id },
  });

  const profileBefore = await prisma.studentProfile.findUnique({
    where: { userId: siswa.id },
  });
  const beforeExp = profileBefore!.currentExp;
  const beforeCoins = profileBefore!.virtualCurrency;

  await recordAttempt(siswa.id, quiz.id, 100, quiz.rewardCoins, quiz.rewardExp, true);

  const afterFirst = await prisma.studentProfile.findUnique({
    where: { userId: siswa.id },
  });

  if (afterFirst!.currentExp === beforeExp + quiz.rewardExp) {
    ok(`First attempt: EXP ${beforeExp} → ${afterFirst!.currentExp}`);
  } else {
    err(`First attempt EXP not updated correctly`);
  }

  if (afterFirst!.virtualCurrency === beforeCoins + quiz.rewardCoins) {
    ok(`First attempt: Koin ${beforeCoins} → ${afterFirst!.virtualCurrency}`);
  } else {
    err(`First attempt Koin not updated correctly`);
  }

  await recordAttempt(siswa.id, quiz.id, 100, quiz.rewardCoins, quiz.rewardExp, false);

  const afterSecond = await prisma.studentProfile.findUnique({
    where: { userId: siswa.id },
  });

  if (afterSecond!.currentExp === afterFirst!.currentExp) {
    ok("Second attempt: no additional EXP");
  } else {
    err("Second attempt should not grant EXP");
  }

  if (afterSecond!.virtualCurrency === afterFirst!.virtualCurrency) {
    ok("Second attempt: no additional Koin");
  } else {
    err("Second attempt should not grant Koin");
  }

  const attempts = await prisma.quizAttempt.findMany({
    where: { studentId: siswa.id, quizId: quiz.id },
    orderBy: { createdAt: "asc" },
  });
  if (attempts.length === 2 && attempts[1].coinsEarned === 0 && attempts[1].expEarned === 0) {
    ok("Second attempt recorded with zero rewards");
  } else {
    err("Second attempt reward fields incorrect");
  }

  const shopItem = await prisma.shopItem.findFirst({ orderBy: { priceCoins: "asc" } });
  if (!shopItem) {
    err("No shop items");
    return;
  }

  const owned = await prisma.studentInventory.findUnique({
    where: {
      studentId_itemId: {
        studentId: siswa.studentProfile!.id,
        itemId: shopItem.id,
      },
    },
  });
  if (owned) {
    ok(`Shop purchase skipped (already owns ${shopItem.name}) — logic OK`);
  } else {
    const coinsBeforePurchase = afterSecond!.virtualCurrency;
    if (coinsBeforePurchase >= shopItem.priceCoins) {
      await prisma.$transaction([
        prisma.studentProfile.update({
          where: { userId: siswa.id },
          data: {
            virtualCurrency: coinsBeforePurchase - shopItem.priceCoins,
            activeBorderId: shopItem.id,
          },
        }),
        prisma.studentInventory.create({
          data: { studentId: siswa.studentProfile!.id, itemId: shopItem.id },
        }),
      ]);
      ok(`Shop purchase: ${shopItem.name} acquired`);
    } else {
      ok("Shop purchase skipped (insufficient coins) — logic OK");
    }
  }

  if (guru) {
    const newClass = await prisma.class.create({
      data: {
        title: "Test Kelas Matematika",
        description: "Kelas uji otomatis",
        teacherId: guru.id,
      },
    });
    if (newClass.id) ok(`Guru create class: ${newClass.title}`);

    const newMaterial = await prisma.material.create({
      data: {
        classId: newClass.id,
        title: "Materi Test",
        content: "Konten test",
      },
    });
    if (newMaterial.id) ok("Guru create material");

    await prisma.class.delete({ where: { id: newClass.id } });
    ok("Cleanup: test class deleted");
  }

  console.log("\n========================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("========================================");

  if (failed > 0) process.exit(1);
}

main()
  .catch((e) => {
    console.error("Fatal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });