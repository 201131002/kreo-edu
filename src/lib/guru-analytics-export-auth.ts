import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkExportRateLimit } from "@/lib/export-rate-limit";
import {
  getAdminAnalyticsSummary,
  parseAdminAnalyticsFilters,
  type AdminAnalyticsSummary,
} from "@/lib/admin-analytics";
import {
  getGuruAnalyticsSummary,
  parseAnalyticsFilters,
  validateAnalyticsFilters,
} from "@/lib/guru-analytics";

export async function getAuthorizedAnalyticsSummary(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "GURU") {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const limited = await checkExportRateLimit(session.user.id);
  if (limited) return { error: limited };

  const { searchParams } = new URL(request.url);
  const rawFilters = parseAnalyticsFilters({
    classId: searchParams.get("classId") ?? undefined,
    quizId: searchParams.get("quizId") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  const filters = await validateAnalyticsFilters(session.user.id, rawFilters);
  const summary = await getGuruAnalyticsSummary(session.user.id, filters);

  return { summary, teacherName: session.user.nama };
}

export async function getAuthorizedAdminAnalytics(
  request: Request
): Promise<
  { error: NextResponse } | { summary: AdminAnalyticsSummary; adminName: string }
> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const limited = await checkExportRateLimit(session.user.id);
  if (limited) return { error: limited };

  const { searchParams } = new URL(request.url);
  const filters = parseAdminAnalyticsFilters({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  const summary = await getAdminAnalyticsSummary(filters);

  return { summary, adminName: session.user.nama };
}