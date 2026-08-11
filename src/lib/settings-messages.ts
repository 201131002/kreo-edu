export const SETTINGS_FLASH: Record<
  string,
  { type: "success" | "error"; text: string }
> = {
  "password-diubah": { type: "success", text: "Password berhasil diubah!" },
  "foto-diubah": { type: "success", text: "Foto profil berhasil diperbarui!" },
  "foto-dihapus": { type: "success", text: "Foto profil dihapus." },
  "nama-diubah": { type: "success", text: "Nama berhasil diperbarui!" },
  unauthorized: { type: "error", text: "Sesi tidak valid. Silakan masuk ulang." },
  "user-tidak-ditemukan": { type: "error", text: "Akun tidak ditemukan." },
  "tidak-ada-foto": { type: "error", text: "Belum ada foto profil untuk dihapus." },
};

export function getSettingsFlash(key: string | undefined) {
  if (!key) return null;
  return SETTINGS_FLASH[key] ?? null;
}