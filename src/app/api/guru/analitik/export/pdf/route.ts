import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { NextResponse } from "next/server";
import { getAuthorizedAnalyticsSummary } from "@/lib/guru-analytics-export-auth";

export async function GET(request: Request) {
  const result = await getAuthorizedAnalyticsSummary(request);
  if ("error" in result) return result.error;

  const { summary, teacherName } = result;
  // Siswa yang belum pernah attempt (bestScore 0, tanpa tanggal) bukan
  // kasus "Belum Lulus" — mereka sudah tercakup di daftar "Belum Attempt".
  const studentsNotPassed = summary.studentsNotPassed.filter(
    (s) => !(s.lastAttemptAt === null && s.bestScore === 0)
  );
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  doc.setFontSize(16);
  doc.text("Analitik Kuis Guru", 14, 18);
  doc.setFontSize(10);
  doc.text(`Guru: ${teacherName}`, 14, 26);
  doc.text(`Diekspor: ${new Date().toLocaleString("id-ID")}`, 14, 32);

  autoTable(doc, {
    startY: 38,
    head: [["Metrik", "Nilai"]],
    body: [
      ["Total Attempt", String(summary.histogram.total)],
      ["Skor 0-59", String(summary.histogram.low)],
      ["Skor 60-79", String(summary.histogram.medium)],
      ["Skor 80-100", String(summary.histogram.high)],
      ["Siswa Belum Lulus", String(studentsNotPassed.length)],
      ["Siswa Belum Attempt", String(summary.studentsNotAttempted.length)],
    ],
    theme: "grid",
    styles: { fontSize: 9 },
  });

  const avgStartY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? 80;

  autoTable(doc, {
    startY: avgStartY + 8,
    head: [["Kelas", "Kuis", "Rata-rata", "Attempt"]],
    body: summary.quizAvgScores.map((row) => [
      row.classTitle,
      row.quizTitle,
      `${row.avgScore}%`,
      String(row.attemptCount),
    ]),
    theme: "striped",
    styles: { fontSize: 8 },
  });

  if (summary.hardestQuestions.length > 0) {
    const hardestStartY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? 120;

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

  doc.addPage();

  autoTable(doc, {
    startY: 18,
    head: [["Siswa", "Kelas", "Kuis", "Skor Terbaik"]],
    body: studentsNotPassed.map((row) => [
      row.studentName,
      row.classTitle,
      row.quizTitle,
      `${row.bestScore}%`,
    ]),
    theme: "striped",
    styles: { fontSize: 8 },
  });

  const notAttemptedStartY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? 60;

  autoTable(doc, {
    startY: notAttemptedStartY + 8,
    head: [["Siswa", "Kelas", "Kuis"]],
    body: summary.studentsNotAttempted.map((row) => [
      row.studentName,
      row.classTitle,
      row.quizTitle,
    ]),
    theme: "striped",
    styles: { fontSize: 8 },
  });

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  const filename = `analitik-kuis-${new Date().toISOString().slice(0, 10)}.pdf`;

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}