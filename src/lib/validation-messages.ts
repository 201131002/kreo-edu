import type { Locale } from "@/i18n/config";
import idMessages from "../../messages/id.json";
import enMessages from "../../messages/en.json";

const catalogs = {
  id: idMessages.validation,
  en: enMessages.validation,
} as const;

export type ValidationMessageKey = keyof typeof idMessages.validation;

export function getValidationErrorMap(
  locale: Locale
): Record<ValidationMessageKey, string> {
  return catalogs[locale] ?? catalogs.id;
}

export function getValidationMessage(
  locale: Locale,
  key: ValidationMessageKey,
  params?: Record<string, string | number>
): string {
  const template = getValidationErrorMap(locale)[key] ?? String(key);

  if (!params) {
    return template;
  }

  return Object.entries(params).reduce(
    (message, [paramKey, paramValue]) =>
      message.replaceAll(`{${paramKey}}`, String(paramValue)),
    template
  );
}