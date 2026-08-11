"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";

function normalizeReturnPath(returnPath?: string): string {
  if (!returnPath?.startsWith("/")) {
    return "/";
  }
  return returnPath;
}

export async function setLocale(locale: Locale, returnPath?: string): Promise<void> {
  if (!isValidLocale(locale)) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const target = normalizeReturnPath(returnPath);
  const pathnameOnly = target.split("?")[0] || "/";

  revalidatePath("/", "layout");
  if (pathnameOnly !== "/") {
    revalidatePath(pathnameOnly);
  }

  redirect(target);
}