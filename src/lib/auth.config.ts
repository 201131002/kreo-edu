import type { NextAuthConfig } from "next-auth";

type UserRole = "ADMIN" | "GURU" | "SISWA";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nama: string;
      email: string;
      role: UserRole;
    };
  }

  interface User {
    role: UserRole;
    nama: string;
    tokenVersion: number;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    tokenVersion?: number;
  }
}

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/masuk",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.nama = user.nama;
        token.tokenVersion = user.tokenVersion;
      }
      // Refresh role dari DB agar perubahan peran oleh admin langsung berlaku
      // untuk sesi JWT target tanpa login ulang. Middleware berjalan di Edge
      // runtime yang tidak mendukung Prisma/pg, jadi query hanya dilakukan di
      // jalur non-Edge (Node runtime); role di edge hanya sementara dari JWT.
      if (token.id && process.env.NEXT_RUNTIME !== "edge") {
        const { prisma } = await import("@/lib/prisma");
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, tokenVersion: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.tokenVersion = dbUser.tokenVersion;
        }
      }
      if (trigger === "update" && session?.user?.nama) {
        token.nama = session.user.nama;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.nama = token.nama as string;
      }
      return session;
    },
  },
};