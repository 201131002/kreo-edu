"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { createBadgeAction } from "@/actions/badge-admin";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ImagePlus } from "lucide-react";

const CRITERIA_OPTIONS = [
  { value: "LEVEL", label: "Capai Level" },
  { value: "QUIZ_COUNT", label: "Jumlah Kuis Selesai" },
  { value: "FIRST_QUIZ", label: "Kuis Pertama" },
] as const;

export function CreateBadgeForm() {
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
            setError("Upload gambar lencana terlebih dahulu");
            return;
          }
          formData.set("badgeImage", file);
          await createBadgeAction(formData);
        });
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="name">Nama Lencana</Label>
        <Input id="name" name="name" placeholder="Pahlawan Baru" required />
      </div>
      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <Input
          id="description"
          name="description"
          placeholder="Syarat atau keterangan singkat"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="criteria">Kriteria</Label>
          <select
            id="criteria"
            name="criteria"
            required
            className="w-full rounded-xl border border-primary/15 bg-white px-3 py-2 text-sm"
            defaultValue="LEVEL"
          >
            {CRITERIA_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="criteriaValue">Nilai Kriteria</Label>
          <Input
            id="criteriaValue"
            name="criteriaValue"
            type="number"
            min={0}
            defaultValue={1}
            required
          />
          <p className="mt-1 text-xs text-muted">
            Level 5, 10 kuis, dll. Untuk Kuis Pertama gunakan 0.
          </p>
        </div>
      </div>
      <div>
        <Label>Gambar Lencana</Label>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/webp,image/jpeg,image/gif"
          className="hidden"
          onChange={onFileChange}
        />
        {preview && (
          <div className="mb-3 flex justify-center rounded-2xl bg-primary/5 p-4">
            <Image
              src={preview}
              alt="Preview lencana"
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
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
          Pilih Gambar
        </Button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending || !preview}>
        {pending ? "Menyimpan..." : "Tambah Lencana"}
      </Button>
    </form>
  );
}