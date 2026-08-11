import { getAdminFlashMessage } from "@/lib/admin-messages";
import { getFlashMessage as getGuruFlashMessage } from "@/lib/guru-messages";

export type FlashMessage = {
  type: "success" | "error";
  text: string;
};

export function resolveFlashMessage(
  success?: string,
  error?: string
): FlashMessage | null {
  const key = success ?? error;
  if (!key) return null;

  const message =
    getAdminFlashMessage(key) ??
    getGuruFlashMessage(key) ??
    getSettingsFlashMessage(key) ??
    getInventoryFlashMessage(key) ??
    getDiscussionFlashMessage(key);

  return message;
}

function getSettingsFlashMessage(key: string): FlashMessage | null {
  const messages: Record<string, FlashMessage> = {
    "password-diubah": { type: "success", text: "Kata sandi berhasil diubah." },
    "foto-diubah": { type: "success", text: "Foto profil berhasil diperbarui." },
    "foto-dihapus": { type: "success", text: "Foto profil dihapus." },
    "data-tidak-valid": { type: "error", text: "Data tidak valid." },
    unauthorized: { type: "error", text: "Sesi tidak valid." },
    "user-tidak-ditemukan": { type: "error", text: "Akun tidak ditemukan." },
    "belum-ada-foto": { type: "error", text: "Belum ada foto profil untuk dihapus." },
  };
  return messages[key] ?? null;
}

function getInventoryFlashMessage(key: string): FlashMessage | null {
  const messages: Record<string, FlashMessage> = {
    "border-dipakai": { type: "success", text: "Border berhasil dipakai!" },
    "border-dilepas": { type: "success", text: "Border dilepas." },
    "lencana-dipakai": { type: "success", text: "Lencana berhasil dipakai!" },
    "lencana-dilepas": { type: "success", text: "Lencana dilepas." },
  };
  return messages[key] ?? null;
}

function getDiscussionFlashMessage(key: string): FlashMessage | null {
  const messages: Record<string, FlashMessage> = {
    "pesan-terkirim": { type: "success", text: "Pesan berhasil dikirim." },
    "kelas-tidak-ditemukan": { type: "error", text: "Kelas tidak ditemukan." },
    unauthorized: { type: "error", text: "Akses ditolak." },
  };
  return messages[key] ?? null;
}