import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { createPgPool } from "../src/lib/db-pool";

const pool = createPgPool();
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log("Testing discussion + leaderboard data...\n");

  const siswa = await prisma.user.findUnique({
    where: { email: "siswa@kreo.id" },
  });
  const guru = await prisma.user.findUnique({
    where: { email: "guru@kreo.id" },
  });
  if (!siswa || !guru) throw new Error("Seed users missing");

  const enrollment = await prisma.classEnrollment.findFirst({
    where: { studentId: siswa.id },
  });
  if (!enrollment) throw new Error("Siswa not enrolled");

  const before = await prisma.discussionMessage.count({
    where: { classId: enrollment.classId },
  });
  console.log(`  Messages in class: ${before}`);

  await prisma.discussionMessage.create({
    data: {
      classId: enrollment.classId,
      senderId: siswa.id,
      content: "Test pesan dari script otomatis",
    },
  });

  const after = await prisma.discussionMessage.count({
    where: { classId: enrollment.classId },
  });
  if (after !== before + 1) throw new Error("Message create failed");
  console.log("  ✅ DiscussionMessage.create works");

  const leaders = await prisma.studentProfile.findMany({
    orderBy: { currentExp: "desc" },
    take: 5,
    include: { user: { select: { nama: true } } },
  });
  if (leaders.length < 2) throw new Error("Need multiple students for leaderboard");
  console.log(`  ✅ Leaderboard has ${leaders.length} entries`);
  console.log(`     #1: ${leaders[0].user.nama} (${leaders[0].currentExp} EXP)`);

  // cleanup test message
  await prisma.discussionMessage.deleteMany({
    where: { content: "Test pesan dari script otomatis" },
  });
  console.log("  ✅ Cleanup done\nAll tests passed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });