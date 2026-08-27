import { z } from "zod";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_PDF_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_EBOOK_SIZE = 30 * 1024 * 1024; // 30MB

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/ogg", "audio/webm"];
const ALLOWED_PDF_TYPES = ["application/pdf"];
const ALLOWED_EBOOK_TYPES = ["application/epub+zip"];

export type MediaType = "IMAGE" | "VIDEO" | "AUDIO" | "PDF" | "EBOOK" | "EMBED";
export type FileMediaType = Exclude<MediaType, "EMBED">;

export function validateMediaFile(file: File): { ok: true; type: FileMediaType; data: File } | { ok: false; error: string } {
  if (!file) {
    return { ok: false, error: "File tidak ditemukan" };
  }

  const size = file.size;
  const type = file.type;

  // Check image
  if (ALLOWED_IMAGE_TYPES.includes(type)) {
    if (size > MAX_IMAGE_SIZE) {
      return { ok: false, error: `Ukuran gambar maksimal ${MAX_IMAGE_SIZE / 1024 / 1024}MB` };
    }
    return { ok: true, type: "IMAGE", data: file };
  }

  // Check video
  if (ALLOWED_VIDEO_TYPES.includes(type)) {
    if (size > MAX_VIDEO_SIZE) {
      return { ok: false, error: `Ukuran video maksimal ${MAX_VIDEO_SIZE / 1024 / 1024}MB` };
    }
    return { ok: true, type: "VIDEO", data: file };
  }

  // Check audio
  if (ALLOWED_AUDIO_TYPES.includes(type)) {
    if (size > MAX_AUDIO_SIZE) {
      return { ok: false, error: `Ukuran audio maksimal ${MAX_AUDIO_SIZE / 1024 / 1024}MB` };
    }
    return { ok: true, type: "AUDIO", data: file };
  }

  // Check PDF
  if (ALLOWED_PDF_TYPES.includes(type)) {
    if (size > MAX_PDF_SIZE) {
      return { ok: false, error: `Ukuran PDF maksimal ${MAX_PDF_SIZE / 1024 / 1024}MB` };
    }
    return { ok: true, type: "PDF", data: file };
  }

  // Check ebook (EPUB)
  if (ALLOWED_EBOOK_TYPES.includes(type)) {
    if (size > MAX_EBOOK_SIZE) {
      return { ok: false, error: `Ukuran e-book maksimal ${MAX_EBOOK_SIZE / 1024 / 1024}MB` };
    }
    return { ok: true, type: "EBOOK", data: file };
  }

  // Fallback by extension for types browsers may send as empty/octet-stream
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const EXT_TO_TYPE: Record<string, MediaType> = {
    mp3: "AUDIO",
    wav: "AUDIO",
    ogg: "AUDIO",
    m4a: "AUDIO",
    epub: "EBOOK",
  };
  const mapped = EXT_TO_TYPE[ext];
  if (mapped === "AUDIO" && size <= MAX_AUDIO_SIZE) {
    return { ok: true, type: "AUDIO", data: file };
  }
  if (mapped === "EBOOK" && size <= MAX_EBOOK_SIZE) {
    return { ok: true, type: "EBOOK", data: file };
  }

  return { ok: false, error: "Format file tidak didukung. Gunakan JPG, PNG, WebP, MP4, MP3, WAV, PDF, atau EPUB" };
}

export function validateEmbedUrl(url: string): { ok: true; type: "EMBED" } | { ok: false; error: string } {
  if (!url || url.trim() === "") {
    return { ok: false, error: "URL tidak boleh kosong" };
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    // YouTube
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      return { ok: true, type: "EMBED" };
    }

    // Vimeo
    if (hostname.includes("vimeo.com")) {
      return { ok: true, type: "EMBED" };
    }

    return { ok: false, error: "URL harus dari YouTube atau Vimeo" };
  } catch {
    return { ok: false, error: "URL tidak valid" };
  }
}

export const mediaSchema = z.object({
  type: z.enum(["IMAGE", "VIDEO", "AUDIO", "PDF", "EBOOK", "EMBED"]),
  url: z.string().url("URL tidak valid"),
  title: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

export const materialMediaSchema = z.object({
  materialId: z.string().optional(),
  media: z.array(mediaSchema).default([]),
});