import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { auth } from "@/lib/auth";
import { signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { SiteLogo } from "@/components/layout/site-logo";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user/user-avatar";

export async function Navbar() {
  const session = await auth();
  const site = await getSiteSettings();

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
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold text-primary">
          <SiteLogo siteName={site.siteName} logoUrl={site.logoUrl} />
          {site.siteName}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {session ? (
            <>
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/pengaturan">Pengaturan</NavLink>
              {session.user.role === "SISWA" && (
                <>
                  <NavLink href="/kelas">Kelas</NavLink>
                  <NavLink href="/toko">Toko</NavLink>
                  <NavLink href="/inventori">Inventori</NavLink>
                  <NavLink href="/peringkat">Peringkat</NavLink>
                  <NavLink href="/laporan">Laporan</NavLink>
                  <NavLink href="/pesan">Pesan</NavLink>
                </>
              )}
              {session.user.role === "GURU" && (
                <>
                  <NavLink href="/guru/kelas">Kelas Saya</NavLink>
                  <NavLink href="/guru/bank-soal">Bank Soal</NavLink>
                  <NavLink href="/guru/jadwal">Jadwal</NavLink>
                  <NavLink href="/guru/siswa">Siswa</NavLink>
                  <NavLink href="/pesan">Pesan</NavLink>
                  <NavLink href="/peringkat">Peringkat</NavLink>
                </>
              )}
              {session.user.role === "ADMIN" && (
                <>
                  <NavLink href="/admin/pengguna">Pengguna</NavLink>
                  <NavLink href="/admin/toko">Toko</NavLink>
                  <NavLink href="/admin/lencana">Lencana</NavLink>
                  <NavLink href="/admin/homepage">Homepage</NavLink>
                  <NavLink href="/pesan">Pesan</NavLink>
                  <NavLink href="/peringkat">Peringkat</NavLink>
                </>
              )}
            </>
          ) : (
            <>
              <NavLink href="/#games">Mini Games</NavLink>
              <NavLink href="/#stats">Statistik</NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {session && displayName ? (
            <>
              <Link
                href="/pengaturan"
                className="flex items-center gap-2.5 rounded-2xl px-2 py-1 transition hover:bg-primary/5"
                title="Pengaturan akun"
              >
                <UserAvatar
                  nama={displayName}
                  imageUrl={dbUser?.imageUrl}
                  borderImageUrl={
                    dbUser?.studentProfile?.activeBorder?.borderImageUrl ?? null
                  }
                  size="sm"
                />
                <span className="hidden max-w-[140px] truncate text-sm font-medium text-foreground sm:block">
                  {displayName}
                </span>
              </Link>
              <Link
                href="/pengaturan"
                className="rounded-xl p-2 text-muted transition hover:bg-primary/5 hover:text-primary md:hidden"
                aria-label="Pengaturan"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Keluar</span>
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/masuk">
                <Button variant="ghost" size="sm">
                  Masuk
                </Button>
              </Link>
              <Link href="/daftar">
                <Button size="sm">Daftar</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-semibold text-foreground/70 transition hover:text-primary"
    >
      {children}
    </Link>
  );
}