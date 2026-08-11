import { Redis } from "@upstash/redis";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const LOCKOUT_SECONDS = 15 * 60;

type AttemptRecord = {
  count: number;
  lockedUntil: number;
};

const failedAttempts = new Map<string, AttemptRecord>();

function normalizeKey(email: string): string {
  return email.trim().toLowerCase();
}

function isDisabled(): boolean {
  return process.env.DISABLE_LOGIN_RATE_LIMIT === "true";
}

function redisKey(email: string): string {
  return `kreo:login:fail:${normalizeKey(email)}`;
}

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return Redis.fromEnv();
}

function memoryIsLimited(email: string): boolean {
  const record = failedAttempts.get(normalizeKey(email));
  if (!record) return false;
  if (Date.now() < record.lockedUntil) return true;
  if (record.count >= MAX_ATTEMPTS) {
    failedAttempts.delete(normalizeKey(email));
  }
  return false;
}

function memoryGetRemaining(email: string): number {
  const record = failedAttempts.get(normalizeKey(email));
  if (!record) return 0;
  return Math.max(0, record.lockedUntil - Date.now());
}

function memoryRecordFailed(email: string): void {
  const key = normalizeKey(email);
  const now = Date.now();
  const existing = failedAttempts.get(key);

  if (existing && now < existing.lockedUntil) {
    return;
  }

  const count =
    (existing && now >= existing.lockedUntil ? 0 : existing?.count ?? 0) + 1;

  if (count >= MAX_ATTEMPTS) {
    failedAttempts.set(key, { count, lockedUntil: now + LOCKOUT_MS });
    return;
  }

  failedAttempts.set(key, { count, lockedUntil: 0 });
}

function memoryClear(email: string): void {
  failedAttempts.delete(normalizeKey(email));
}

async function redisIsLimited(email: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return memoryIsLimited(email);

  const key = redisKey(email);
  const lockedUntil = await redis.get<number>(`${key}:lock`);
  if (lockedUntil && Date.now() < lockedUntil) return true;

  const count = (await redis.get<number>(`${key}:count`)) ?? 0;
  return count >= MAX_ATTEMPTS;
}

async function redisGetRemaining(email: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return memoryGetRemaining(email);

  const lockedUntil = await redis.get<number>(`${redisKey(email)}:lock`);
  if (!lockedUntil) return 0;
  return Math.max(0, lockedUntil - Date.now());
}

async function redisRecordFailed(email: string): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    memoryRecordFailed(email);
    return;
  }

  const key = redisKey(email);
  const lockedUntil = await redis.get<number>(`${key}:lock`);
  if (lockedUntil && Date.now() < lockedUntil) return;

  const count = await redis.incr(`${key}:count`);
  await redis.expire(`${key}:count`, LOCKOUT_SECONDS);

  if (count >= MAX_ATTEMPTS) {
    await redis.set(`${key}:lock`, Date.now() + LOCKOUT_MS, { ex: LOCKOUT_SECONDS });
  }
}

async function redisClear(email: string): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    memoryClear(email);
    return;
  }

  const key = redisKey(email);
  await redis.del(`${key}:count`, `${key}:lock`);
}

export async function isLoginRateLimited(email: string): Promise<boolean> {
  if (isDisabled()) return false;
  return redisIsLimited(email);
}

export async function getLoginLockoutRemainingMs(email: string): Promise<number> {
  if (isDisabled()) return 0;
  return redisGetRemaining(email);
}

export async function recordFailedLogin(email: string): Promise<void> {
  if (isDisabled()) return;
  await redisRecordFailed(email);
}

export async function clearFailedLogin(email: string): Promise<void> {
  await redisClear(email);
}