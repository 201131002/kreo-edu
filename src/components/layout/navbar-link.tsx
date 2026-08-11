"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isActiveNavPath } from "@/components/layout/sidebar-nav";

export function NavbarLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = isActiveNavPath(pathname, href);

  return (
    <Link
      href={href}
      className={cn(
        "rounded-xl px-3 py-2 text-sm font-semibold transition",
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground/70 hover:bg-primary/5 hover:text-primary"
      )}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}