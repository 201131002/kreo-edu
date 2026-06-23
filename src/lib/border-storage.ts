import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { put, del } from "@vercel/blob";
import type { ValidatedImage } from "@/lib/image-validation";

function useBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function localBorderDir(): string {
  return path.join(process.cwd(), "public", "uploads", "borders");
}

function isLocalBorderUrl(url: string): boolean {
  return url.startsWith("/uploads/borders/");
}

export async function saveBorderImage(image: ValidatedImage): Promise<string> {
  const filename = `border-${Date.now()}.${image.extension}`;

  if (useBlobStorage()) {
    const blob = await put(`borders/${filename}`, image.buffer, {
      access: "public",
      contentType: image.mime,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const dir = localBorderDir();
  await mkdir(dir, { recursive: true });
  const filepath = path.join(dir, filename);
  await writeFile(filepath, image.buffer);
  return `/uploads/borders/${filename}`;
}

export async function deleteBorderImage(url: string): Promise<void> {
  if (!url || url.startsWith("/borders/")) return;

  try {
    if (useBlobStorage() && url.includes("blob.vercel-storage.com")) {
      await del(url);
      return;
    }

    if (isLocalBorderUrl(url)) {
      const filepath = path.join(process.cwd(), "public", url);
      await unlink(filepath);
    }
  } catch {
    // Best-effort cleanup
  }
}