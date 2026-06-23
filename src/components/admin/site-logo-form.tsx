"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  removeSiteLogoAction,
  uploadSiteLogoAction,
} from "@/actions/site-settings";
import { SiteLogo } from "@/components/layout/site-logo";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2 } from "lucide-react";

export function SiteLogoForm({
  siteName,
  logoUrl,
}: {
  siteName: string;
  logoUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [removing, startRemove] = useTransition();

  const displayUrl = preview ?? logoUrl;

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
      <div className="flex items-center gap-4">
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt={`Logo ${siteName}`}
            width={80}
            height={80}
            className="h-20 w-20 rounded-2xl border-2 border-primary/20 object-cover"
            unoptimized={displayUrl.startsWith("/uploads/") || displayUrl.startsWith("blob:")}
          />
        ) : (
          <SiteLogo siteName={siteName} logoUrl={null} size="lg" />
        )}
        <div className="text-sm text-muted">
          <p>Logo tampil di navbar dan footer. Kosongkan untuk ikon default.</p>
          <p className="mt-1">Disarankan gambar persegi, min. 128×128 px.</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        name="logo"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onFileChange}
      />

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
          Pilih Logo
        </Button>

        <form
          action={(formData) => {
            startTransition(async () => {
              setError(null);
              const file = inputRef.current?.files?.[0];
              if (!file) {
                setError("Pilih gambar terlebih dahulu");
                return;
              }
              formData.set("logo", file);
              const result = await uploadSiteLogoAction(formData);
              if (result?.error) setError(result.error);
            });
          }}
        >
          <Button type="submit" size="sm" disabled={pending || !preview}>
            {pending ? "Mengunggah..." : "Simpan Logo"}
          </Button>
        </form>

        {logoUrl && (
          <form
            action={() => {
              startRemove(async () => {
                setError(null);
                await removeSiteLogoAction();
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
              Hapus Logo
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}