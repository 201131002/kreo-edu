import Image from "next/image";
import { UserAvatar } from "@/components/user/user-avatar";

export function BorderPreview({
  borderImageUrl,
  nama = "Siswa",
  size = "lg",
  className,
}: {
  borderImageUrl: string;
  nama?: string;
  size?: "md" | "lg" | "xl";
  className?: string;
}) {
  return (
    <div className={className}>
      <UserAvatar
        nama={nama}
        imageUrl={null}
        borderImageUrl={borderImageUrl}
        size={size}
      />
    </div>
  );
}

export function BorderCardPreview({
  borderImageUrl,
  className,
}: {
  borderImageUrl: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex h-28 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/5 to-tertiary/5 ${className ?? ""}`}
    >
      <Image
        src={borderImageUrl}
        alt="Preview border"
        width={96}
        height={96}
        className="h-24 w-24 object-contain"
        unoptimized={
          borderImageUrl.startsWith("/uploads/") || borderImageUrl.endsWith(".svg")
        }
      />
    </div>
  );
}