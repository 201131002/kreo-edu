"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav-config";

export function isActiveNavPath(pathname: string, href: string) {
  const pathOnly = href.split("#")[0] || href;
  if (pathOnly === "/") {
    return pathname === "/";
  }
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  }
  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}

export function SidebarNavLink({
  item,
  onNavigate,
  compact = false,
}: {
  item: NavItem;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const Icon = item.icon;
  const active = isActiveNavPath(pathname, item.href);

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex min-h-[44px] items-center gap-3 rounded-xl text-sm font-semibold transition",
          compact ? "px-2.5 py-2" : "px-3 py-3",
          active
            ? "bg-primary/10 text-primary"
            : "text-foreground/80 hover:bg-primary/5 hover:text-primary"
        )}
        aria-current={active ? "page" : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {t(item.labelKey)}
      </Link>
    </li>
  );
}

export function SidebarNavSection({
  title,
  items,
  onNavigate,
  compact = false,
}: {
  title: string;
  items: NavItem[];
  onNavigate?: () => void;
  compact?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <>
      <p
        className={cn(
          "mb-2 px-3 text-xs font-bold uppercase tracking-wide text-muted",
          compact ? "mt-4" : "mt-6 first:mt-0"
        )}
      >
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <SidebarNavLink
            key={item.href}
            item={item}
            onNavigate={onNavigate}
            compact={compact}
          />
        ))}
      </ul>
    </>
  );
}