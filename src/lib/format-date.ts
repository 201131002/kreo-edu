import { defaultLocale, isValidLocale, type Locale } from "@/i18n/config";

function resolveLocale(locale: string | Locale): Locale {
  return isValidLocale(locale) ? locale : defaultLocale;
}

type DateInput = Date | string | number;

/**
 * Formats a date-time for display following the active locale.
 * ID: "5 Juli 2026, 14.30" · EN: "July 5, 2026, 2:30 PM"
 */
export function formatDateTime(date: DateInput, locale: string | Locale): string {
  const value = date instanceof Date ? date : new Date(date);
  const resolvedLocale = resolveLocale(locale);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  const intlLocale = resolvedLocale === "id" ? "id-ID" : "en-US";

  return new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: resolvedLocale === "en",
  }).format(value);
}

/**
 * Formats a date without time for display following the active locale.
 */
export function formatDate(date: DateInput, locale: string | Locale): string {
  const value = date instanceof Date ? date : new Date(date);
  const resolvedLocale = resolveLocale(locale);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  const intlLocale = resolvedLocale === "id" ? "id-ID" : "en-US";

  return new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}