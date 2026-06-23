import Image from "next/image";
import { cn } from "@/lib/utils";

export function BadgeIcon({
  imageUrl,
  name,
  size = "md",
  className,
}: {
  imageUrl: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const px = size === "sm" ? 24 : size === "lg" ? 64 : 40;

  return (
    <Image
      src={imageUrl}
      alt={`Lencana ${name}`}
      width={px}
      height={px}
      className={cn("shrink-0 object-contain", className)}
      unoptimized={imageUrl.startsWith("/uploads/") || imageUrl.endsWith(".svg")}
      title={name}
    />
  );
}