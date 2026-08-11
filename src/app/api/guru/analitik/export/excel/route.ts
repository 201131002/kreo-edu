import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { getAuthorizedAnalyticsSummary } from "@/lib/guru-analytics-export-auth";

export async function GET(request: Request) {
  const result = await getAuthorizedAnalyticsSummary(request);
  if ("error" in result) return result.error;

  const { summary, teacherName } = result;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "KREO";
  workbook.created = new Date();

  const overview = workbook.addWorksheet("Ringkasan");
  overview.addRow(["Analitik Kuis Guru", teacherName]);
  overview.addRow(["Total Attempt", summary.histogram.total]);
  overview.addRow(["Histogram 0-59", summary.histogram.low]);
  overview.addRow(["Histogram 60-79", summary.histogram.medium]);
  overview.addRow(["Histogram 80-100", summary.histogram.high]);
  overview.addRow([]);

  const avgSheet = workbook.addWorksheet("Rata-rata per Kuis");
  avgSheet.addRow(["Kelas", "Kuis", "Rata-rata Skor", "Jumlah Attempt"]);
  for (const row of summary.quizAvgScores) {
    avgSheet.addRow([row.classTitle, row.quizTitle, row.avgScore, row.attemptCount]);
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

  const notPassedSheet = workbook.addWorksheet("Belum Lulus");
  notPassedSheet.addRow([
    "Siswa",
    "Email",
    "Kelas",
    "Kuis",
    "Skor Terbaik",
    "Attempt Terakhir",
  ]);
  for (const row of summary.studentsNotPassed) {
    notPassedSheet.addRow([
      row.studentName,
      row.studentEmail,
      row.classTitle,
      row.quizTitle,
      row.bestScore,
      row.lastAttemptAt?.toISOString() ?? "-",
    ]);
  }

  const notAttemptedSheet = workbook.addWorksheet("Belum Attempt");
  notAttemptedSheet.addRow(["Siswa", "Email", "Kelas", "Kuis"]);
  for (const row of summary.studentsNotAttempted) {
    notAttemptedSheet.addRow([
      row.studentName,
      row.studentEmail,
      row.classTitle,
      row.quizTitle,
    ]);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `analitik-kuis-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}