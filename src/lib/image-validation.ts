const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type ImageKind = "jpeg" | "png" | "webp" | "gif";

const SIGNATURES: { kind: ImageKind; mime: string; bytes: number[]; offset?: number }[] = [
  { kind: "jpeg", mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { kind: "png", mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { kind: "gif", mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { kind: "webp", mime: "image/webp", bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 },
];

const EXTENSION: Record<ImageKind, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
  gif: "gif",
};

export type ValidatedImage = {
  buffer: Buffer;
  mime: string;
  extension: string;
};

function matchesSignature(buffer: Buffer, signature: number[], offset = 0): boolean {
  if (buffer.length < offset + signature.length) return false;
  return signature.every((byte, i) => buffer[offset + i] === byte);
}

function detectImageKind(buffer: Buffer): ImageKind | null {
  if (matchesSignature(buffer, [0xff, 0xd8, 0xff])) return "jpeg";
  if (matchesSignature(buffer, [0x89, 0x50, 0x4e, 0x47])) return "png";
  if (matchesSignature(buffer, [0x47, 0x49, 0x46, 0x38])) return "gif";
  if (
    matchesSignature(buffer, [0x52, 0x49, 0x46, 0x46]) &&
    matchesSignature(buffer, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return "webp";
  }
  return null;
}

export async function validateAvatarFile(
  file: File
): Promise<{ ok: true; data: ValidatedImage } | { ok: false; error: string }> {
  if (!file || file.size === 0) {
    return { ok: false, error: "File gambar wajib dipilih" };
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, error: "Ukuran gambar maksimal 2 MB" };
  }

  const declaredMime = file.type.toLowerCase();
  if (!ALLOWED_MIME.has(declaredMime)) {
    return {
      ok: false,
      error: "Format tidak didukung. Gunakan JPG, PNG, WebP, atau GIF saja",
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const kind = detectImageKind(buffer);
  if (!kind) {
    return {
      ok: false,
      error: "File bukan gambar valid. Upload ditolak demi keamanan",
    };
  }

  const expectedMime = SIGNATURES.find((s) => s.kind === kind)?.mime;
  if (declaredMime !== expectedMime) {
    return {
      ok: false,
      error: "Tipe file tidak cocok dengan isi gambar (kemungkinan file palsu)",
    };
  }

  return {
    ok: true,
    data: {
      buffer,
      mime: expectedMime!,
      extension: EXTENSION[kind],
    },
  };
}