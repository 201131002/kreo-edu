import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { NextResponse } from "next/server";
import {
  ADMIN_EXPORT_FILENAME_BASE,
  getAuthorizedAdminAnalytics,
} from "../shared";

export async function GET(request: Request) {
  const result = await getAuthorizedAdminAnalytics(request);
  if ("error" in result) return result.error;

  const { summary, adminName } = result;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  doc.setFontSize(16);
  doc.text("Analitik Global KREO", 14, 18);
  doc.setFontSize(10);
  doc.text(`Admin: ${adminName}`, 14, 26);
  doc.text(`Diekspor: ${new Date().toLocaleString("id-ID")}`, 14, 32);

  autoTable(doc, {
    startY: 38,
    head: [["Metrik", "Nilai"]],
    body: [
      ["Total Pengguna", String(summary.totalUsers)],
      ["Total Kelas", String(summary.totalClasses)],
      ["Total Kuis", String(summary.totalQuizzes)],
      ["Total Attempt", String(summary.totalAttempts)],
      ["Rata-rata Skor", `${summary.avgScore}%`],
      ["Aktif 7 Hari", String(summary.activeUsers7d)],
      ["Aktif 30 Hari", String(summary.activeUsers30d)],
    ],
    theme: "grid",
    styles: { fontSize: 9 },
  });

  const growthStartY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? 80;

  autoTable(doc, {
    startY: growthStartY + 8,
    head: [["Pekan Mulai", "Pengguna Baru", "Percobaan"]],
    body: summary.weeklyGrowth.map((row) => [
      row.weekStart.toISOString().slice(0, 10),
      String(row.newUsers),
      String(row.newAttempts),
    ]),
    theme: "striped",
    styles: { fontSize: 8 },
  });

  const rankingStartY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? 120;

  autoTable(doc, {
    startY: rankingStartY + 8,
    head: [["Kelas", "Guru", "Siswa", "Percobaan", "Rata-rata"]],
    body: summary.classRanking.map((row) => [
      row.classTitle,
      row.teacherName,
      String(row.studentCount),
      String(row.attemptCount),
      `${row.avgScore}%`,
    ]),
    theme: "striped",
    styles: { fontSize: 8 },
  });

  const hardestStartY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? 160;

  if (summary.hardestQuestions.length > 0) {
    autoTable(doc, {
      startY: hardestStartY + 8,
      head: [["Kuis", "Soal", "Salah", "Total", "Error %"]],
      body: summary.hardestQuestions.map((row) => [
        row.quizTitle,
        row.questionText.slice(0, 80),
        String(row.wrongCount),
        String(row.totalAnswers),
        `${row.errorRate}%`,
      ]),
      theme: "striped",
      styles: { fontSize: 7 },
    });
  }

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  const filename = `${ADMIN_EXPORT_FILENAME_BASE}-${new Date().toISOString().slice(0, 10)}.pdf`;

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
