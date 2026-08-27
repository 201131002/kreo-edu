"use client";

import { useState, useTransition } from "react";
import {
  deleteMaterialAction,
  updateMaterialAction,
} from "@/actions/class";
import { SubmitButton } from "@/components/guru/submit-button";
import { Button } from "@/components/ui/button";
import { ConfirmForm } from "@/components/ui/confirm-button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { FileText, Pencil, Trash2, X } from "lucide-react";

const TYPE_LABEL: Record<string, string> = {
  IMAGE: "Gambar",
  VIDEO: "Video",
  AUDIO: "Audio",
  PDF: "PDF",
  EBOOK: "E-Book",
  EMBED: "Embed",
};

export function MaterialRow({
  material,
  classId,
}: {
  material: {
    id: string;
    title: string;
    content: string | null;
    media: { id: string; type: string; url: string; title: string | null }[];
  };
  classId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [embedInput, setEmbedInput] = useState("");
  const [embedUrls, setEmbedUrls] = useState<string[]>([]);
  const [removeIds, setRemoveIds] = useState<string[]>([]);

  const addEmbed = () => {
    if (embedInput.trim()) {
      setEmbedUrls([...embedUrls, embedInput.trim()]);
      setEmbedInput("");
    }
  };

  if (editing) {
    const removableMedia = material.media.filter((m) => !removeIds.includes(m.id));
    return (
      <Card className="border-primary/20">
        <form action={updateMaterialAction} className="space-y-4">
          <input type="hidden" name="materialId" value={material.id} />
          <input type="hidden" name="classId" value={classId} />
          <div>
            <Label htmlFor={`mt-${material.id}`}>Judul</Label>
            <Input
              id={`mt-${material.id}`}
              name="title"
              defaultValue={material.title}
              required
            />
          </div>
          <div>
            <Label htmlFor={`mc-${material.id}`}>Isi</Label>
            <Textarea
              id={`mc-${material.id}`}
              name="content"
              defaultValue={material.content ?? ""}
              rows={4}
              required
            />
          </div>

          {material.media.length > 0 && (
            <div>
              <Label className="text-sm font-semibold">Media saat ini</Label>
              <ul className="mt-2 space-y-1">
                {removableMedia.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-2 rounded border border-border px-2 py-1 text-sm"
                  >
                    <span className="min-w-0 truncate">
                      <span className="mr-1.5 font-medium">{TYPE_LABEL[m.type] ?? m.type}</span>
                      {m.title || m.url}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRemoveIds([...removeIds, m.id])}
                      title="Hapus media ini"
                      className="shrink-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              {removeIds.map((id) => (
                <input key={id} type="hidden" name="removeMediaIds" value={id} />
              ))}
              {removeIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setRemoveIds([])}
                  className="mt-1 text-xs text-muted-foreground underline hover:text-foreground"
                >
                  Batalkan penghapusan ({removeIds.length})
                </button>
              )}
            </div>
          )}

          <div>
            <Label htmlFor={`mf-${material.id}`} className="text-sm font-medium">
              Tambah media (gambar, video, audio, PDF, e-book)
            </Label>
            <Input
              id={`mf-${material.id}`}
              name="mediaFiles"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,audio/mpeg,audio/wav,audio/ogg,.mp3,.m4a,.epub,application/epub+zip,application/pdf"
              className="cursor-pointer mt-1"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Maks: gambar 5MB · video 100MB · audio 50MB · PDF 20MB · e-book 30MB.
            </p>
          </div>

          <div>
            <Label htmlFor={`me-${material.id}`} className="text-sm font-medium">
              Tambah tautan video (YouTube/Vimeo)
            </Label>
            <div className="mt-1 flex gap-2">
              <Input
                id={`me-${material.id}`}
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
              <ul className="mt-2 space-y-1 text-sm">
                {embedUrls.map((url, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 rounded border border-border bg-background px-1 py-0.5"
                  >
                    <span className="truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => setEmbedUrls(embedUrls.filter((_, j) => j !== i))}
                      className="shrink-0 text-xs font-medium text-red-500 hover:text-red-700"
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

          <div className="flex gap-2">
            <SubmitButton variant="primary" size="sm">
              Simpan
            </SubmitButton>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(false);
                setRemoveIds([]);
                setEmbedUrls([]);
                setEmbedInput("");
              }}
            >
              Batal
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="flex items-start gap-3">
      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <CardTitle className="text-base">{material.title}</CardTitle>
        <CardDescription className="mt-1 line-clamp-3">
          {material.content}
        </CardDescription>
        {material.media.length > 0 && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {material.media.length} lampiran media
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={`Edit materi ${material.title}`}
          onClick={() => setEditing(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <ConfirmForm
          confirmMessage={`Hapus materi "${material.title}"?`}
          action={deleteMaterialAction}
        >
          {(isPending) => (
            <>
              <input type="hidden" name="materialId" value={material.id} />
              <input type="hidden" name="classId" value={classId} />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                aria-label={`Hapus materi ${material.title}`}
                disabled={pending || isPending}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </ConfirmForm>
      </div>
    </Card>
  );
}