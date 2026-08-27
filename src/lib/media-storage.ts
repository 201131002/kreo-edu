import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const UPLOADS_ROOT = path.resolve(process.cwd(), "public", "uploads");

function localMediaDir(type: string): string {
  return path.join(UPLOADS_ROOT, type);
}

/**
 * Sanitasi ekstensi file: hanya izinkan karakter alfanumerik, tolak path
 * separator dan karakter khusus yang bisa dipakai untuk traversal.
 */
function sanitizeExtension(filename: string): string {
  const raw = filename.split(".").pop() || "";
  const cleaned = raw.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
  return cleaned || "bin";
}

export async function saveMediaFile(
  materialId: string,
  file: File,
  type: "images" | "videos" | "audios" | "pdfs" | "ebooks"
): Promise<string> {
  const dir = localMediaDir(type);
  await mkdir(dir, { recursive: true });

  const ext = sanitizeExtension(file.name);
  const filename = `${materialId}-${Date.now()}-${randomUUID()}.${ext}`;
  const filepath = path.resolve(dir, filename);

  // Pastikan path akhir tetap di dalam direktori uploads — mencegah traversal
  // jika materialId atau komponen lain mengandung karakter berbahaya.
  if (!filepath.startsWith(UPLOADS_ROOT)) {
    throw new Error("Invalid upload path");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return `/uploads/${type}/${filename}`;
}

export async function deleteMediaFile(url: string): Promise<void> {
  if (!url) return;

  try {
    if (url.startsWith("/uploads/")) {
      const filepath = path.resolve(process.cwd(), "public", url);
      // Tolak path yang keluar dari direktori uploads (mis. /uploads/../../etc/passwd)
      if (!filepath.startsWith(UPLOADS_ROOT)) return;
      await unlink(filepath);
    }
  } catch {
    // Best-effort cleanup
  }
}