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