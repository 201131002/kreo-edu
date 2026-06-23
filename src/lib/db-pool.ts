import pg from "pg";

/**
 * Normalizes DATABASE_URL SSL params to avoid pg v8 deprecation warnings
 * when connecting to managed Postgres (Prisma Postgres, Neon, etc.).
 */
export function normalizeDatabaseUrl(raw: string | undefined): string {
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }

  try {
    const normalized = raw.replace(/^postgres:\/\//, "postgresql://");
    const url = new URL(normalized);
    const isLocal =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";

    if (!isLocal) {
      const sslmode = url.searchParams.get("sslmode");
      if (
        !sslmode ||
        sslmode === "prefer" ||
        sslmode === "require" ||
        sslmode === "verify-ca"
      ) {
        url.searchParams.set("sslmode", "verify-full");
      }
    }

    return url.toString().replace(/^postgresql:\/\//, "postgres://");
  } catch {
    return raw;
  }
}

export function createPgPool(): pg.Pool {
  return new pg.Pool({
    connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
  });
}