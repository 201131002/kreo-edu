"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FEATURE_NAV_BY_ROLE,
  PRIMARY_NAV_LINKS,
  PUBLIC_NAV_LINKS,
  type UserRole,
} from "@/lib/nav-config";
import { SidebarNavLink, SidebarNavSection } from "@/components/layout/sidebar-nav";

export function MobileSidebar({ role }: { role: UserRole | null }) {
  const [mounted, setMounted] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");
  const featureItems = role ? FEATURE_NAV_BY_ROLE[role] : PUBLIC_NAV_LINKS;

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    window.setTimeout(() => setPanelOpen(false), 300);
  }, []);

  const open = useCallback(() => {
    setPanelOpen(true);
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!panelOpen) {
      return;
    }

    const scrollY = window.scrollY;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [panelOpen, close]);

  const panel =
    panelOpen && mounted ? (
      <>
        <button
          type="button"
          className={cn(
            "fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 md:hidden",
            visible ? "opacity-100" : "opacity-0"
          )}
          aria-label={t("closeMenu")}
          onClick={close}
        />
        <aside
          id="mobile-sidebar"
          className={cn(
            "fixed inset-y-0 left-0 z-[70] flex w-[min(18rem,85vw)] flex-col border-r border-primary/10 bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden",
            visible ? "translate-x-0" : "-translate-x-full"
          )}
          aria-hidden={!visible}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-primary/10 px-4 pt-[env(safe-area-inset-top)]">
            <span className="font-display text-lg font-bold text-primary">
              {t("menu")}
            </span>
            <button
              type="button"
              onClick={close}
              className="flex h-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-foreground/70 transition hover:bg-primary/5 hover:text-primary"
              aria-label={t("closeMenu")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {role ? (
              <>
                <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wide text-muted">
                  {t("dashboard")}
                </p>
                <ul className="space-y-1">
                  {PRIMARY_NAV_LINKS.map((item) => (
                    <SidebarNavLink
                      key={item.href}
                      item={item}
                      onNavigate={close}
                    />
                  ))}
                </ul>
                <SidebarNavSection
                  title={t("features")}
                  items={featureItems}
                  onNavigate={close}
                />
              </>
            ) : (
              <>
                <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wide text-muted">
                  {t("menu")}
                </p>
                <ul className="space-y-1">
                  {featureItems.map((item) => (
                    <SidebarNavLink
                      key={item.href}
                      item={item}
                      onNavigate={close}
                    />
                  ))}
                </ul>
              </>
            )}
          </nav>
        </aside>
      </>
    ) : null;

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={open}
        className="flex h-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-foreground/70 transition hover:bg-primary/5 hover:text-primary"
        aria-label={t("menu")}
        aria-expanded={panelOpen}
        aria-controls="mobile-sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}