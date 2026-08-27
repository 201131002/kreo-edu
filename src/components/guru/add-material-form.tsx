"use client";

import { useState } from "react";
import { createMaterialAction } from "@/actions/class";
import { SubmitButton } from "@/components/guru/submit-button";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export function AddMaterialForm({ classId }: { classId: string }) {
  const [embedUrls, setEmbedUrls] = useState<string[]>([]);
  const [embedInput, setEmbedInput] = useState("");

  const addEmbed = () => {
    if (embedInput.trim()) {
      setEmbedUrls([...embedUrls, embedInput.trim()]);
      setEmbedInput("");
    }
  };

  const removeEmbed = (index: number) => {
    setEmbedUrls(embedUrls.filter((_, i) => i !== index));
  };

  return (
    <form action={createMaterialAction} className="space-y-5">
      <input type="hidden" name="classId" value={classId} />
      <div className="grid gap-4">
        <div>
          <Label htmlFor="material-title">Judul Materi</Label>
          <Input
            id="material-title"
            name="title"
            placeholder="Contoh: Mengenal Planet"
            required
          />
        </div>
        <div>
          <Label htmlFor="material-content">Isi Materi</Label>
          <Textarea
            id="material-content"
            name="content"
            placeholder="Tulis penjelasan materi untuk siswa..."
            rows={5}
            required
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold uppercase tracking-wide text-muted">
          Media (opsional)
        </Label>
        <div className="mt-2 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-dashed border-border p-3">
            <Label htmlFor="media-files" className="text-sm font-medium">
              Upload file
            </Label>
            <Input
              id="media-files"
              name="mediaFiles"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,audio/mpeg,audio/wav,audio/ogg,.mp3,.m4a,.epub,application/epub+zip,application/pdf"
              className="cursor-pointer mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Gambar, video, audio, PDF, e-book. Maks: gambar 5MB · video 100MB · audio 50MB · PDF
              20MB · e-book 30MB.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <Label htmlFor="embed-url" className="text-sm font-medium">
              Tautan video (YouTube/Vimeo)
            </Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="embed-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={embedInput}
                onChange={(e) => setEmbedInput(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addEmbed}>
                Tambah
              </Button>
            </div>
            {embedUrls.length > 0 && (
              <ul className="mt-2 text-sm space-y-1">
                {embedUrls.map((url, i) => (
                  <li key={i} className="flex justify-between items-center gap-2 px-1 py-0.5 rounded bg-background border border-border">
                    <span className="truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => removeEmbed(i)}
                      className="shrink-0 text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Hapus
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {embedUrls.map((url, i) => (
              <input key={i} type="hidden" name="embedUrls" value={url} />
            ))}
          </div>
        </div>
      </div>

      <SubmitButton variant="tertiary" size="sm">
        Simpan Materi
      </SubmitButton>
    </form>
  );
}