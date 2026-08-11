"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  Coins,
  FileText,
  Medal,
  Package,
  ShoppingBag,
  Star,
  Trophy,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { StudentOnboardingData } from "@/lib/student-onboarding-defaults";
import { Button } from "@/components/ui/button";

const STEP_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  FileText,
  ClipboardList,
  ShoppingBag,
  Package,
  Medal,
  Trophy,
  Star,
  Coins,
};

const LOGIN_PENDING_COOKIE = "kreo-onboarding-pending";

function dismissedStorageKey(userId: string): string {
  return `kreo-student-onboarding-dismissed-${userId}`;
}

function hasLoginPendingCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${LOGIN_PENDING_COOKIE}=`));
}

function clearLoginPendingCookie(): void {
  document.cookie = `${LOGIN_PENDING_COOKIE}=; Max-Age=0; path=/`;
}

function shouldShowAfterLogin(searchParams: URLSearchParams): boolean {
  return searchParams.get("onboarding") === "1" || hasLoginPendingCookie();
}

export function StudentOnboardingModal({
  userId,
  onboarding,
  version,
}: {
  userId: string;
  onboarding: StudentOnboardingData;
  version: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const clearLoginTrigger = useCallback(() => {
    clearLoginPendingCookie();
    if (searchParams.get("onboarding") === "1") {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("onboarding");
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  const dismiss = useCallback(() => {
    localStorage.setItem(dismissedStorageKey(userId), version);
    clearLoginTrigger();
    setOpen(false);
  }, [clearLoginTrigger, userId, version]);

  useEffect(() => {
    setMounted(true);
    if (!onboarding.enabled) return;

    const loginTriggered = shouldShowAfterLogin(searchParams);
    const dismissed = localStorage.getItem(dismissedStorageKey(userId));

    if (loginTriggered) {
      clearLoginPendingCookie();
      setOpen(true);
      return;
    }

    if (dismissed === version) return;
    setOpen(true);
  }, [onboarding.enabled, searchParams, userId, version]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, dismiss]);

  if (!onboarding.enabled || !mounted || !open) {
    return null;
  }

  const panel = (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
        aria-label="Tutup panduan"
        onClick={dismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-onboarding-title"
        className="fixed inset-x-4 top-[max(1rem,env(safe-area-inset-top))] z-[90] mx-auto max-h-[min(90vh,42rem)] w-full max-w-lg overflow-hidden rounded-3xl border border-primary/15 bg-white shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85vh] sm:-translate-x-1/2 sm:-translate-y-1/2"
      >
        <div className="border-b border-primary/10 bg-gradient-to-br from-primary/10 via-white to-tertiary/5 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="student-onboarding-title"
                className="font-display text-xl font-bold text-foreground"
              >
                {onboarding.title}
              </h2>
              <p className="mt-1 text-sm text-muted">{onboarding.description}</p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition hover:bg-primary/10 hover:text-primary"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <ol className="max-h-[min(52vh,28rem)] space-y-3 overflow-y-auto overscroll-contain px-5 py-4">
          {onboarding.steps.map((step, index) => {
            const Icon = STEP_ICONS[step.icon] ?? Star;
            return (
              <li
                key={`${step.order}-${step.title}`}
                className="flex gap-3 rounded-2xl border border-primary/10 bg-white/90 p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    <p className="font-semibold text-foreground">{step.title}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted">{step.description}</p>
                  {step.href ? (
                    <Link
                      href={step.href}
                      onClick={dismiss}
                      className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                    >
                      Buka →
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="border-t border-primary/10 bg-surface/40 px-5 py-4">
          <Button type="button" className="w-full" onClick={dismiss}>
            {onboarding.dismissLabel}
          </Button>
        </div>
      </div>
    </>
  );

  return createPortal(panel, document.body);
}