"use client";

import { useRef, useState, useTransition } from "react";
import { uploadAvatarAction, removeAvatarAction } from "@/actions/settings";
import { UserAvatar } from "@/components/user/user-avatar";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2 } from "lucide-react";

export function AvatarForm({
  nama,
  imageUrl,
  borderImageUrl,
}: {
  nama: string;
  imageUrl: string | null;
  borderImageUrl?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [removing, startRemove] = useTransition();

  const displayUrl = preview ?? imageUrl;

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Format harus JPG, PNG, WebP, atau GIF");
      e.target.value = "";
      setPreview(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran maksimal 2 MB");
      e.target.value = "";
      setPreview(null);
      return;
    }

    setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <UserAvatar
          nama={nama}
          imageUrl={displayUrl}
          borderImageUrl={borderImageUrl}
          size="xl"
        />

        <div className="flex-1 space-y-3 text-sm text-muted">
          <p>Upload foto profil yang tampil di navbar untuk semua role.</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Format: JPG, PNG, WebP, GIF</li>
            <li>Maksimal 2 MB</li>
            <li>File diverifikasi di server (anti file palsu)</li>
          </ul>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        name="avatar"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onFileChange}
      />

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <form
          action={(formData) => {
            startTransition(async () => {
              setError(null);
              const file = inputRef.current?.files?.[0];
              if (!file) {
                setError("Pilih gambar terlebih dahulu");
                return;
              }
              formData.set("avatar", file);
              const result = await uploadAvatarAction(formData);
              if (result?.error) setError(result.error);
            });
          }}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
            Pilih Gambar
          </Button>
          <Button type="submit" size="sm" disabled={pending || !preview} className="ml-2">
            {pending ? "Mengunggah..." : "Simpan Foto"}
          </Button>
        </form>

        {imageUrl && (
          <form
            action={() => {
              startRemove(async () => {
                setError(null);
                await removeAvatarAction();
              });
            }}
          >
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              disabled={removing}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Hapus Foto
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}