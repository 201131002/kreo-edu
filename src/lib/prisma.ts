import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type pg from "pg";
import { createPgPool } from "@/lib/db-pool";

/** Naikkan angka ini setiap ada perubahan schema Prisma agar cache dev di-refresh. */
const PRISMA_CLIENT_VERSION = 10;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
  prismaVersion?: number;
};

function createPrismaClient() {
  const pool = globalForPrisma.pool ?? createPgPool();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function isPrismaClientReady(client: PrismaClient): boolean {
  const delegates = client as PrismaClient & {
    siteSettings?: { findUnique?: unknown };
    shopItem?: { findUnique?: unknown };
    studentBadge?: { findMany?: unknown };
    badge?: { findMany?: unknown };
    questionBankItem?: { findMany?: unknown };
  };
  return (
    typeof delegates.siteSettings?.findUnique === "function" &&
    typeof delegates.shopItem?.findUnique === "function" &&
    typeof delegates.studentBadge?.findMany === "function" &&
    typeof delegates.badge?.findMany === "function" &&
    typeof delegates.questionBankItem?.findMany === "function"
  );
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (
    cached &&
    globalForPrisma.prismaVersion === PRISMA_CLIENT_VERSION &&
    isPrismaClientReady(cached)
  ) {
    return cached;
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaVersion = PRISMA_CLIENT_VERSION;
  }
  return client;
}

export const prisma = getPrismaClient();