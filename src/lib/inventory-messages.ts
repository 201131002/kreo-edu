export const INVENTORY_FLASH_MESSAGES: Record<
  string,
  { type: "success" | "error"; text: string }
> = {
  "border-dipakai": { type: "success", text: "Border berhasil dipakai di foto profil!" },
  "border-dilepas": { type: "success", text: "Border dilepas dari foto profil." },
  "border-tidak-dimiliki": {
    type: "error",
    text: "Kamu belum memiliki border ini. Beli dulu di toko.",
  },
  "tidak-ada-border-aktif": { type: "error", text: "Tidak ada border yang sedang dipakai." },
  "data-tidak-valid": { type: "error", text: "Data tidak valid." },
  "lencana-dipakai": {
    type: "success",
    text: "Lencana berhasil dipakai di papan peringkat!",
  },
  "lencana-dilepas": { type: "success", text: "Lencana dilepas dari profil peringkat." },
  "lencana-tidak-dimiliki": {
    type: "error",
    text: "Kamu belum memiliki lencana ini. Naik level untuk mendapatkannya!",
  },
  "tidak-ada-lencana-aktif": { type: "error", text: "Tidak ada lencana yang sedang dipakai." },
};

export function getInventoryFlashMessage(key: string | undefined) {
  if (!key) return null;
  return INVENTORY_FLASH_MESSAGES[key] ?? null;
}