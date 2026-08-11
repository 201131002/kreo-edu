"use client";

import { Suspense } from "react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { cn } from "@/lib/utils";

function LanguageSwitcherFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-[32px] min-w-[4.75rem] animate-pulse items-center rounded-xl border border-primary/15 bg-white/80 p-0.5 sm:h-[36px] sm:min-w-[5.5rem]",
        className
      )}
      aria-hidden
    >
      <div className="mx-1 h-6 flex-1 rounded-lg bg-primary/10" />
      <div className="mx-1 h-6 flex-1 rounded-lg bg-primary/10" />
    </div>
  );
}

export function LanguageSwitcherShell({ className }: { className?: string }) {
  return (
    <Suspense fallback={<LanguageSwitcherFallback className={className} />}>
      <LanguageSwitcher className={className} />
    </Suspense>
  );
}