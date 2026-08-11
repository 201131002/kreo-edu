require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./src/generated/prisma/client');
const { createPgPool } = require('./src/lib/db-pool');
(async () => {
  const pool = createPgPool();
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const classes = await prisma.class.findMany({ take: 5, select: { id: true, title: true, description: true } });
  console.log('CLASSES:', JSON.stringify(classes, null, 0));
  const quizzes = await prisma.quiz.findMany({ take: 5, select: { id: true, title: true, classId: true } });
  console.log('QUIZZES:', JSON.stringify(quizzes));
  const students = await prisma.user.findMany({ where: { role: 'SISWA' }, take: 5, select: { id: true, nama: true, studentProfile: { select: { currentLevel: true, currentExp: true, virtualCurrency: true } } } });
  console.log('STUDENTS:', JSON.stringify(students));
  await prisma.$disconnect();
})().catch(e => { console.error(e.message); process.exit(1); });
