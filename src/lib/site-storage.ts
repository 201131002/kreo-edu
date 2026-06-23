import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { put, del } from "@vercel/blob";
import type { ValidatedImage } from "@/lib/image-validation";

function useBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function localSiteDir(): string {
  return path.join(process.cwd(), "public", "uploads", "site");
}

function isLocalSiteUrl(url: string): boolean {
  return url.startsWith("/uploads/site/");
}

export async function saveSiteLogo(image: ValidatedImage): Promise<string> {
  const filename = `logo-${Date.now()}.${image.extension}`;

  if (useBlobStorage()) {
    const blob = await put(`site/${filename}`, image.buffer, {
      access: "public",
      contentType: image.mime,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const dir = localSiteDir();
  await mkdir(dir, { recursive: true });
  const filepath = path.join(dir, filename);
  await writeFile(filepath, image.buffer);
  return `/uploads/site/${filename}`;
}

export async function deleteSiteLogo(url: string): Promise<void> {
  if (!url) return;

  try {
    if (useBlobStorage() && url.includes("blob.vercel-storage.com")) {
      await del(url);
      return;
    }

    if (isLocalSiteUrl(url)) {
      const filepath = path.join(process.cwd(), "public", url);
      await unlink(filepath);
    }
  } catch {
    // Best-effort cleanup
  }
}