import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const EXPORT_LIMIT = 10;
const WINDOW_SECONDS = 60;

const memoryHits = new Map<string, number[]>();

function isDisabled(): boolean {
  return process.env.DISABLE_EXPORT_RATE_LIMIT === "true";
}

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return Redis.fromEnv();
}

let redisRatelimit: Ratelimit | null | undefined;

function getRedisRatelimit(): Ratelimit | null {
  if (redisRatelimit === undefined) {
    const redis = getRedis();
    redisRatelimit = redis
      ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(EXPORT_LIMIT, `${WINDOW_SECONDS} s`),
          prefix: "kreo:export",
        })
      : null;
  }
  return redisRatelimit;
}

function memoryCheck(userId: string): boolean {
  const now = Date.now();
  const windowMs = WINDOW_SECONDS * 1000;
  const hits = (memoryHits.get(userId) ?? []).filter(
    (t) => now - t < windowMs
  );
  if (hits.length >= EXPORT_LIMIT) {
    memoryHits.set(userId, hits);
    return false;
  }
  hits.push(now);
  memoryHits.set(userId, hits);
  return true;
}

/**
 * Sliding-window rate limit for heavy export endpoints.
 * Returns a 429 NextResponse when the caller exceeds the limit, otherwise null.
 * Falls back to in-process memory when Upstash Redis is not configured.
 */
export async function checkExportRateLimit(
  userId: string
): Promise<NextResponse | null> {
  if (isDisabled()) return null;

  const ratelimit = getRedisRatelimit();
  if (ratelimit) {
    const { success } = await ratelimit.limit(userId);
    if (!success) {
      return NextResponse.json(
        { error: "Too many export requests. Try again shortly." },
        { status: 429 }
      );
    }
    return null;
  }

  if (!memoryCheck(userId)) {
    return NextResponse.json(
      { error: "Too many export requests. Try again shortly." },
      { status: 429 }
    );
  }
  return null;
}
