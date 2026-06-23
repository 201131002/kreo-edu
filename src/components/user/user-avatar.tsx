import Image from "next/image";
import { cn } from "@/lib/utils";

function initialsFromName(nama: string): string {
  const parts = nama.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const sizeMap = {
  sm: { outer: 40, inner: 28, text: "text-xs" },
  md: { outer: 48, inner: 34, text: "text-sm" },
  lg: { outer: 80, inner: 56, text: "text-xl" },
  xl: { outer: 112, inner: 78, text: "text-2xl" },
};

function isLocalUpload(url: string): boolean {
  return url.startsWith("/uploads/");
}

function AvatarFace({
  nama,
  imageUrl,
  innerPx,
  textClass,
}: {
  nama: string;
  imageUrl?: string | null;
  innerPx: number;
  textClass: string;
}) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={`Foto profil ${nama}`}
        width={innerPx}
        height={innerPx}
        className="h-full w-full rounded-full object-cover"
        unoptimized={isLocalUpload(imageUrl)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-tertiary font-bold text-white",
        textClass
      )}
      aria-hidden
    >
      {initialsFromName(nama)}
    </div>
  );
}

export function UserAvatar({
  nama,
  imageUrl,
  borderImageUrl,
  size = "md",
  className,
}: {
  nama: string;
  imageUrl?: string | null;
  borderImageUrl?: string | null;
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  const s = sizeMap[size];

  if (!borderImageUrl) {
    if (imageUrl) {
      return (
        <Image
          src={imageUrl}
          alt={`Foto profil ${nama}`}
          width={s.inner}
          height={s.inner}
          className={cn(
            "shrink-0 rounded-full border-2 border-primary/20 object-cover",
            size === "sm" && "h-8 w-8",
            size === "md" && "h-10 w-10",
            size === "lg" && "h-20 w-20",
            size === "xl" && "h-28 w-28",
            className
          )}
          unoptimized={isLocalUpload(imageUrl)}
        />
      );
    }

    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-gradient-to-br from-primary to-tertiary font-bold text-white",
          size === "sm" && "h-8 w-8 text-xs",
          size === "md" && "h-10 w-10 text-sm",
          size === "lg" && "h-20 w-20 text-xl",
          size === "xl" && "h-28 w-28 text-2xl",
          className
        )}
        aria-hidden
      >
        {initialsFromName(nama)}
      </div>
    );
  }

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: s.outer, height: s.outer }}
      title={nama}
    >
      <div
        className="absolute overflow-hidden rounded-full"
        style={{
          top: "14%",
          left: "14%",
          width: "72%",
          height: "72%",
        }}
      >
        <AvatarFace
          nama={nama}
          imageUrl={imageUrl}
          innerPx={s.inner}
          textClass={s.text}
        />
      </div>
      <Image
        src={borderImageUrl}
        alt=""
        fill
        className="pointer-events-none object-contain"
        unoptimized={isLocalUpload(borderImageUrl) || borderImageUrl.endsWith(".svg")}
        aria-hidden
      />
    </div>
  );
}