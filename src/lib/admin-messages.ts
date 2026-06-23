export const ADMIN_FLASH_MESSAGES: Record<
  string,
  { type: "success" | "error"; text: string }
> = {
  "user-dibuat": { type: "success", text: "Pengguna baru berhasil ditambahkan." },
  "role-diubah": { type: "success", text: "Role pengguna berhasil diubah." },
  "user-dihapus": { type: "success", text: "Pengguna berhasil dihapus." },
  "progress-direset": { type: "success", text: "Progress siswa berhasil direset." },
  "data-tidak-valid": { type: "error", text: "Data tidak valid. Periksa kembali formulir." },
  "user-tidak-ditemukan": { type: "error", text: "Pengguna tidak ditemukan." },
  "email-sudah-ada": { type: "error", text: "Email sudah terdaftar." },
  "tidak-bisa-edit-diri": { type: "error", text: "Kamu tidak bisa mengubah akun sendiri dari sini." },
  "admin-terakhir": { type: "error", text: "Tidak bisa — minimal harus ada 1 admin." },
  "guru-punya-kelas": {
    type: "error",
    text: "Guru masih memiliki kelas. Hapus atau pindahkan kelas terlebih dahulu.",
  },
  unauthorized: { type: "error", text: "Akses ditolak." },
  "homepage-disimpan": { type: "success", text: "Pengaturan homepage berhasil disimpan." },
  "logo-diubah": { type: "success", text: "Logo situs berhasil diperbarui." },
  "logo-dihapus": { type: "success", text: "Logo situs dihapus — kembali ke ikon default." },
  "tidak-ada-logo": { type: "error", text: "Belum ada logo untuk dihapus." },
  "item-ditambah": { type: "success", text: "Border baru berhasil ditambahkan ke toko." },
  "border-tidak-valid": {
    type: "error",
    text: "Gambar border tidak valid. Gunakan PNG/WebP/JPG maks. 2 MB.",
  },
  "lencana-ditambah": { type: "success", text: "Lencana baru berhasil ditambahkan." },
  "lencana-diubah": { type: "success", text: "Lencana berhasil diperbarui." },
  "lencana-dihapus": { type: "success", text: "Lencana berhasil dihapus." },
  "lencana-tidak-ditemukan": { type: "error", text: "Lencana tidak ditemukan." },
  "kriteria-sudah-ada": {
    type: "error",
    text: "Kombinasi kriteria dan nilai sudah dipakai lencana lain.",
  },
};

export function getAdminFlashMessage(key: string | undefined) {
  if (!key) return null;
  return ADMIN_FLASH_MESSAGES[key] ?? null;
}