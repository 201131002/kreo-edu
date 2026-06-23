export const DISCUSSION_FLASH: Record<
  string,
  { type: "success" | "error"; text: string }
> = {
  "pesan-terkirim": { type: "success", text: "Pesan berhasil dikirim!" },
  "pesan-tidak-valid": {
    type: "error",
    text: "Pesan tidak valid (1–500 karakter).",
  },
  "akses-ditolak": { type: "error", text: "Kamu tidak punya akses ke diskusi kelas ini." },
};

export function getDiscussionFlash(key: string | undefined) {
  if (!key) return null;
  return DISCUSSION_FLASH[key] ?? null;
}