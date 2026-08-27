import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { put, del } from "@vercel/blob";
import type { ValidatedImage } from "@/lib/image-validation";

function useBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function localAvatarDir(): string {
  return path.join(process.cwd(), "public", "uploads", "avatars");
}

function isLocalAvatarUrl(url: string): boolean {
  return url.startsWith("/uploads/avatars/");
}

export async function saveAvatar(
  userId: string,
  image: ValidatedImage
): Promise<string> {
  const filename = `${userId}-${Date.now()}.${image.extension}`;

  if (useBlobStorage()) {
    const blob = await put(`avatars/${filename}`, image.buffer, {
      access: "public",
      contentType: image.mime,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const dir = localAvatarDir();
  await mkdir(dir, { recursive: true });
  const filepath = path.join(dir, filename);
  await writeFile(filepath, image.buffer);
  return `/uploads/avatars/${filename}`;
}

export async function deleteAvatarFile(url: string): Promise<void> {
  if (!url) return;

  try {
    if (useBlobStorage() && url.includes("blob.vercel-storage.com")) {
      await del(url);
      return;
    }

    if (isLocalAvatarUrl(url)) {
      const filepath = path.resolve(process.cwd(), "public", url);
      const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");
      if (!filepath.startsWith(uploadsRoot)) return;
      await unlink(filepath);
    }
  } catch {
    // Best-effort cleanup — jangan gagalkan upload baru
  }
}