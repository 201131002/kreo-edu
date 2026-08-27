"use client";

import { Download, BookOpen, Headphones } from "lucide-react";
import { getEmbedUrl } from "@/lib/embed-utils";

interface MediaItem {
  id: string;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "PDF" | "EBOOK" | "EMBED";
  url: string;
  title: string | null;
}

export function MediaRenderer({ media }: { media: MediaItem }) {
  const { type, url, title } = media;

  if (type === "IMAGE") {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
        <img
          src={url}
          alt={title || "Gambar"}
          className="mx-auto max-h-[70vh] w-auto max-w-full"
          loading="lazy"
        />
      </div>
    );
  }

  if (type === "VIDEO") {
    return (
      <video
        src={url}
        controls
        className="max-w-full rounded-lg border border-border"
        playsInline
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  if (type === "AUDIO") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Headphones className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          {title && (
            <p className="mb-1 truncate text-sm font-medium">{title}</p>
          )}
          <audio src={url} controls className="w-full" preload="none" />
        </div>
      </div>
    );
  }

  if (type === "PDF") {
    return (
      <div className="space-y-2">
        <iframe
          src={url}
          className="w-full h-[70vh] rounded-lg border border-border"
          title={title || "PDF Viewer"}
        />
        <a
          href={url}
          download
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Download className="h-4 w-4" /> Unduh PDF
        </a>
      </div>
    );
  }

  if (type === "EBOOK") {
    // EPUB tidak bisa dirender browser secara native — tampilkan kartu pembaca dengan link unduh.
    return (
      <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/40 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BookOpen className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title || "E-Book (EPUB)"}</p>
          <p className="text-xs text-muted-foreground">
            Format EPUB — unduh untuk dibaca di aplikasi e-reader.
          </p>
        </div>
        <a
          href={url}
          download
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Download className="h-4 w-4" /> Unduh
        </a>
      </div>
    );
  }

  if (type === "EMBED") {
    const embedUrl = getEmbedUrl(url);
    if (!embedUrl) {
      return (
        <div className="p-4 text-sm text-muted-foreground rounded-lg border border-border">
          Tautan tidak valid: {url}
        </div>
      );
    }
    return (
      <iframe
        src={embedUrl}
        className="w-full aspect-video rounded-lg border border-border"
        title={title || "Embed Video"}
        allowFullScreen
        allow="autoplay; encrypted-media"
      />
    );
  }

  return null;
}