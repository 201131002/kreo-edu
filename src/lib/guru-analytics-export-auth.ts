import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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