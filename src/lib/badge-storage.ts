import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { put, del } from "@vercel/blob";
import type { ValidatedImage } from "@/lib/image-validation";

function useBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function localBadgeDir(): string {
  return path.join(process.cwd(), "public", "uploads", "badges");
}

function isLocalBadgeUrl(url: string): boolean {
  return url.startsWith("/uploads/badges/");
}

export async function saveBadgeImage(image: ValidatedImage): Promise<string> {
  const filename = `badge-${Date.now()}.${image.extension}`;

  if (useBlobStorage()) {
    const blob = await put(`badges/${filename}`, image.buffer, {
      access: "public",
      contentType: image.mime,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const dir = localBadgeDir();
  await mkdir(dir, { recursive: true });
  const filepath = path.join(dir, filename);
  await writeFile(filepath, image.buffer);
  return `/uploads/badges/${filename}`;
}

export async function deleteBadgeImage(url: string): Promise<void> {
  if (!url || url.startsWith("/badges/")) return;

  try {
    if (useBlobStorage() && url.includes("blob.vercel-storage.com")) {
      await del(url);
      return;
    }

    if (isLocalBadgeUrl(url)) {
      const filepath = path.resolve(process.cwd(), "public", url);
      const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");
      if (!filepath.startsWith(uploadsRoot)) return;
      await unlink(filepath);
    }
  } catch {
    // Best-effort cleanup
  }
}