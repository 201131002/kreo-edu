import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import {
  ADMIN_EXPORT_FILENAME_BASE,
  getAuthorizedAdminAnalytics,
} from "../shared";

export async function GET(request: Request) {
  const result = await getAuthorizedAdminAnalytics(request);
  if ("error" in result) return result.error;

  const { summary, adminName } = result;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "KREO";
  workbook.created = new Date();

  const overview = workbook.addWorksheet("Ringkasan");
  overview.addRow(["Analitik Global KREO", adminName]);
  overview.addRow(["Total Pengguna", summary.totalUsers]);
  overview.addRow(["Total Kelas", summary.totalClasses]);
  overview.addRow(["Total Kuis", summary.totalQuizzes]);
  overview.addRow(["Total Attempt", summary.totalAttempts]);
  overview.addRow(["Rata-rata Skor", summary.avgScore]);
  overview.addRow(["Pengguna Aktif 7 Hari", summary.activeUsers7d]);
  overview.addRow(["Pengguna Aktif 30 Hari", summary.activeUsers30d]);
  overview.addRow([]);

  const growthSheet = workbook.addWorksheet("Pertumbuhan");
  growthSheet.addRow(["Pekan Mulai", "Pengguna Baru", "Percobaan"]);
  for (const row of summary.weeklyGrowth) {
    growthSheet.addRow([
      row.weekStart.toISOString().slice(0, 10),
      row.newUsers,
      row.newAttempts,
    ]);
  }

  const rankingSheet = workbook.addWorksheet("Peringkat Kelas");
  rankingSheet.addRow(["Kelas", "Guru", "Siswa", "Percobaan", "Rata-rata"]);
  for (const row of summary.classRanking) {
    rankingSheet.addRow([
      row.classTitle,
      row.teacherName,
      row.studentCount,
      row.attemptCount,
      row.avgScore,
    ]);
  }

  const hardestSheet = workbook.addWorksheet("Soal Tersulit");
  hardestSheet.addRow(["Kuis", "Soal", "Salah", "Total Jawaban", "Tingkat Salah %"]);
  for (const row of summary.hardestQuestions) {
    hardestSheet.addRow([
      row.quizTitle,
      row.questionText,
      row.wrongCount,
      row.totalAnswers,
      row.errorRate,
    ]);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `${ADMIN_EXPORT_FILENAME_BASE}-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
