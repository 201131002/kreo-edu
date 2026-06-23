import Image from "next/image";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function SiteLogo({
  siteName,
  logoUrl,
  size = "md",
  className,
}: {
  siteName: string;
  logoUrl: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const box =
    size === "sm" ? "h-10 w-10" : size === "lg" ? "h-14 w-14" : "h-10 w-10";
  const iconSize =
    size === "sm" ? "h-5 w-5" : size === "lg" ? "h-7 w-7" : "h-5 w-5";

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={`Logo ${siteName}`}
        width={size === "lg" ? 56 : 40}
        height={size === "lg" ? 56 : 40}
        className={cn("shrink-0 rounded-2xl object-cover", box, className)}
        unoptimized={logoUrl.startsWith("/uploads/")}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_4px_0_#0284c7]",
        box,
        className
      )}
    >
      <Sparkles className={iconSize} />
    </span>
  );
}