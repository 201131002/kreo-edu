"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { createShopItemAction } from "@/actions/shop";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ImagePlus } from "lucide-react";

export function CreateShopItemForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }

    const allowed = ["image/png", "image/webp", "image/jpeg", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Format harus PNG, WebP, JPG, atau GIF");
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
    <form
      action={(formData) => {
        startTransition(async () => {
          setError(null);
          const file = inputRef.current?.files?.[0];
          if (!file) {
            setError("Upload gambar border terlebih dahulu");
            return;
          }
          formData.set("borderImage", file);
          await createShopItemAction(formData);
        });
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="name">Nama Border</Label>
        <Input id="name" name="name" placeholder="Border Emas" required />
      </div>
      <div>
        <Label htmlFor="priceCoins">Harga (Koin)</Label>
        <Input
          id="priceCoins"
          name="priceCoins"
          type="number"
          min={0}
          defaultValue={50}
          required
        />
      </div>
      <div>
        <Label>Gambar Border (PNG transparan)</Label>
        <p className="mb-2 text-xs text-muted">
          Gunakan frame PNG dengan tengah transparan — mengelilingi foto profil siswa.
        </p>
        <input
          ref={inputRef}
          type="file"
          name="borderImage"
          accept="image/png,image/webp,image/jpeg,image/gif"
          className="hidden"
          onChange={onFileChange}
        />
        {preview && (
          <div className="mb-3 flex justify-center rounded-2xl bg-primary/5 p-4">
            <Image
              src={preview}
              alt="Preview border"
              width={120}
              height={120}
              className="h-28 w-28 object-contain"
              unoptimized
            />
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
          Pilih Gambar Border
        </Button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <Button type="submit" disabled={pending || !preview}>
        {pending ? "Menyimpan..." : "Tambah Border"}
      </Button>
    </form>
  );
}