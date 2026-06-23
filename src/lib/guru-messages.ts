export const GURU_FLASH_MESSAGES: Record<string, { type: "success" | "error"; text: string }> = {
  "kelas-dibuat": { type: "success", text: "Kelas berhasil dibuat! Sekarang tambahkan materi dan kuis." },
  "kelas-diubah": { type: "success", text: "Kelas berhasil diperbarui." },
  "kelas-dihapus": { type: "success", text: "Kelas berhasil dihapus." },
  "materi-ditambah": { type: "success", text: "Materi berhasil ditambahkan." },
  "materi-diubah": { type: "success", text: "Materi berhasil diperbarui." },
  "materi-dihapus": { type: "success", text: "Materi berhasil dihapus." },
  "kuis-dibuat": { type: "success", text: "Kuis dibuat! Tambahkan soal di bawah." },
  "kuis-diubah": { type: "success", text: "Kuis berhasil diperbarui." },
  "kuis-dihapus": { type: "success", text: "Kuis berhasil dihapus." },
  "soal-ditambah": { type: "success", text: "Soal berhasil ditambahkan." },
  "soal-diubah": { type: "success", text: "Soal berhasil diperbarui." },
  "soal-dihapus": { type: "success", text: "Soal berhasil dihapus." },
  "pilih-soal-dulu": { type: "error", text: "Pilih minimal satu soal dari bank soal." },
  "soal-bank-tidak-ditemukan": { type: "error", text: "Soal bank tidak ditemukan." },
  "jadwal-disimpan": { type: "success", text: "Jadwal belajar berhasil disimpan." },
  "waktu-tidak-valid": { type: "error", text: "Waktu selesai harus setelah waktu mulai." },
  "data-tidak-valid": { type: "error", text: "Data tidak valid. Periksa kembali formulir." },
  "kelas-tidak-ditemukan": { type: "error", text: "Kelas tidak ditemukan." },
  "kuis-tidak-ditemukan": { type: "error", text: "Kuis tidak ditemukan." },
  "materi-tidak-ditemukan": { type: "error", text: "Materi tidak ditemukan." },
  "soal-tidak-ditemukan": { type: "error", text: "Soal tidak ditemukan." },
  unauthorized: { type: "error", text: "Akses ditolak." },
};

export function getFlashMessage(key: string | undefined) {
  if (!key) return null;

  const bulkMatch = key.match(/^soal-bank-(\d+)$/);
  if (bulkMatch) {
    const count = bulkMatch[1];
    return {
      type: "success" as const,
      text: `${count} soal dari bank soal berhasil ditambahkan ke kuis.`,
    };
  }

  return GURU_FLASH_MESSAGES[key] ?? null;
}