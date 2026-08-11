"use client";

import { useCallback, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { setLocale } from "@/actions/locale";
import { type Locale, locales } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("common");
  const [pending, setPending] = useState(false);
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);

  const returnPath =
    pathname +
    (searchParams.toString() ? `?${searchParams.toString()}` : "");

  const displayLocale = pendingLocale ?? locale;

  const handleChange = useCallback(
    async (nextLocale: Locale) => {
      if (nextLocale === locale || pending) {
        return;
      }

      setPending(true);
      setPendingLocale(nextLocale);

      await setLocale(nextLocale, returnPath);
    },
    [locale, pending, returnPath]
  );

  return (
    <div
      className={cn(
        "relative flex items-center rounded-xl border border-primary/15 bg-white/80 p-0.5",
        pending && "opacity-80",
        className
      )}
      role="group"
      aria-label={t("language")}
      aria-busy={pending}
    >
      {locales.map((item) => {
        const active = item === displayLocale;
        const isLoading = pending && pendingLocale === item;

        return (
          <button
            key={item}
            type="button"
            onClick={() => handleChange(item)}
            disabled={pending}
            aria-pressed={active}
            aria-label={
              item === "id" ? t("switchToIndonesian") : t("switchToEnglish")
            }
            className={cn(
              "relative flex min-h-[28px] min-w-[2.25rem] items-center justify-center rounded-lg px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide transition sm:min-h-[32px] sm:min-w-[2.75rem] sm:px-2.5 sm:py-1 sm:text-xs",
              active
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-primary",
              pending && !isLoading && "pointer-events-none"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              item
            )}
          </button>
        );
      })}
    </div>
  );
}