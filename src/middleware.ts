import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const roleRoutes: Record<string, string[]> = {
  SISWA: ["/dashboard/siswa", "/kelas", "/toko", "/inventori", "/laporan", "/jadwal", "/pesan", "/peringkat"],
  GURU: ["/dashboard/guru", "/guru", "/kelas", "/pesan", "/peringkat"],
  ADMIN: ["/dashboard/admin", "/admin", "/pesan", "/peringkat"],
};

function isAllowed(pathname: string, role: string): boolean {
  const allowed = roleRoutes[role] ?? [];
  return allowed.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAuthPage = pathname === "/masuk" || pathname === "/daftar";
  const isPublic = pathname === "/" || isAuthPage;

  if (isPublic) {
    if (isLoggedIn && isAuthPage) {
      const role = req.auth?.user?.role ?? "SISWA";
      const dashboard =
        role === "ADMIN"
          ? "/dashboard/admin"
          : role === "GURU"
            ? "/dashboard/guru"
            : "/dashboard/siswa";
      return NextResponse.redirect(new URL(dashboard, req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/masuk", req.url));
  }

  const role = req.auth?.user?.role ?? "SISWA";

  if (pathname === "/pengaturan" || pathname.startsWith("/pengaturan/")) {
    return NextResponse.next();
  }

  if (pathname === "/dashboard") {
    const dashboard =
      role === "ADMIN"
        ? "/dashboard/admin"
        : role === "GURU"
          ? "/dashboard/guru"
          : "/dashboard/siswa";
    return NextResponse.redirect(new URL(dashboard, req.url));
  }

  if (!isAllowed(pathname, role)) {
    const fallback =
      role === "ADMIN"
        ? "/dashboard/admin"
        : role === "GURU"
          ? "/dashboard/guru"
          : "/dashboard/siswa";
    return NextResponse.redirect(new URL(fallback, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};