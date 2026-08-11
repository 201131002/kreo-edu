import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { getDesktopNavbarLinks, isAppRole } from "@/lib/nav-config";
import { SiteLogo } from "@/components/layout/site-logo";
import { LanguageSwitcherShell } from "@/components/layout/language-switcher-shell";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { NavbarLink } from "@/components/layout/navbar-link";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user/user-avatar";

export async function Navbar() {
  const session = await auth();
  const site = await getSiteSettings();
  const t = await getTranslations("nav");
  const tc = await getTranslations("common");

  const role = session?.user.role;
  const desktopNavLinks =
    role && isAppRole(role) ? getDesktopNavbarLinks(role) : [];
  const isLoggedIn = !!session;

  const dbUser = session
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          imageUrl: true,
          nama: true,
          studentProfile: {
            select: {
              activeBorder: { select: { borderImageUrl: true } },
            },
          },
        },
      })
    : null;

  const displayName = dbUser?.nama ?? session?.user.nama;

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex min-h-[4.25rem] max-w-6xl items-center gap-2 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 sm:pb-3.5">
        {/* Kiri: menu mobile + brand + nav utama (login) */}
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <MobileSidebar role={isAppRole(role) ? role : null} />
          <Link
            href={isLoggedIn ? "/dashboard" : "/"}
            className="flex min-w-0 items-center gap-1.5 rounded-xl py-1 pr-1 transition hover:opacity-90 sm:gap-2"
            title={site.siteName}
          >
            <SiteLogo siteName={site.siteName} logoUrl={site.logoUrl} />
            <span className="truncate font-display text-lg font-bold text-primary sm:text-xl md:text-2xl">
              {site.siteName}
            </span>
          </Link>

          {isLoggedIn && desktopNavLinks.length > 0 ? (
            <>
              <span
                className="mx-0.5 hidden h-7 w-px shrink-0 bg-primary/15 md:block"
                aria-hidden
              />
              <nav
                className="hidden items-center md:flex"
                aria-label={t("dashboard")}
              >
                {desktopNavLinks.map((link) => (
                  <NavbarLink key={link.href} href={link.href}>
                    {t(link.labelKey)}
                  </NavbarLink>
                ))}
              </nav>
            </>
          ) : null}
        </div>

        {/* Tengah: hanya tamu (homepage) */}
        {!isLoggedIn ? (
          <nav
            className="hidden flex-1 items-center justify-center gap-1 md:flex lg:gap-2"
            aria-label={t("menu")}
          >
            <NavbarLink href="/#games">{t("adventures")}</NavbarLink>
            <NavbarLink href="/#stats">{t("statistics")}</NavbarLink>
            <NavbarLink href="/bantuan">{t("help")}</NavbarLink>
          </nav>
        ) : (
          <div className="min-w-2 flex-1 md:min-w-4" aria-hidden />
        )}

        {/* Kanan: utilitas + akun */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <LanguageSwitcherShell />

          {isLoggedIn && displayName ? (
            <div
              className="flex items-center rounded-2xl border border-primary/10 bg-white/70 p-0.5 shadow-sm sm:p-1"
              role="group"
              aria-label={tc("accountSettings")}
            >
              <Link href="/pengaturan" title={t("settings")}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl px-2.5 sm:px-3"
                  aria-label={t("settings")}
                >
                  <Settings className="h-5 w-5 shrink-0" aria-hidden />
                  <span className="hidden sm:inline">{t("settings")}</span>
                </Button>
              </Link>

              <span
                className="mx-0.5 hidden h-7 w-px bg-primary/10 sm:block"
                aria-hidden
              />

              <div
                className="hidden min-w-0 max-w-[9rem] items-center gap-2 px-1.5 sm:flex md:max-w-[11rem]"
                title={displayName}
              >
                <UserAvatar
                  nama={displayName}
                  imageUrl={dbUser?.imageUrl}
                  borderImageUrl={
                    dbUser?.studentProfile?.activeBorder?.borderImageUrl ?? null
                  }
                  size="sm"
                />
                <span className="truncate text-sm font-medium text-foreground">
                  {displayName}
                </span>
              </div>

              <div className="flex sm:hidden" title={displayName}>
                <UserAvatar
                  nama={displayName}
                  imageUrl={dbUser?.imageUrl}
                  borderImageUrl={
                    dbUser?.studentProfile?.activeBorder?.borderImageUrl ?? null
                  }
                  size="sm"
                />
              </div>

              <span
                className="mx-0.5 hidden h-7 w-px bg-primary/10 sm:block"
                aria-hidden
              />

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="h-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl px-2.5 sm:px-3"
                  aria-label={tc("logout")}
                >
                  <LogOut className="h-5 w-5 shrink-0" aria-hidden />
                  <span className="hidden sm:inline">{tc("logout")}</span>
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link href="/masuk" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="min-h-[44px]">
                  {tc("login")}
                </Button>
              </Link>
              <Link href="/masuk" className="sm:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-h-[44px] min-w-[44px] px-2"
                  aria-label={tc("login")}
                >
                  <span className="text-xs font-bold">{tc("login")}</span>
                </Button>
              </Link>
              <Link href="/daftar">
                <Button size="sm" className="min-h-[44px] px-3 sm:px-4">
                  <span className="hidden sm:inline">{tc("register")}</span>
                  <span className="sm:hidden text-xs font-bold">{tc("register")}</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}