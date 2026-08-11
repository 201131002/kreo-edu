"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { signIn } from "@/lib/auth";
import {
  clearFailedLogin,
  getLoginLockoutRemainingMs,
  isLoginRateLimited,
  recordFailedLogin,
} from "@/lib/auth-rate-limit";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validations";
import { AuthError } from "next-auth";

function productionAuthSecretError(): string | null {
  if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
    return "Konfigurasi server tidak lengkap (AUTH_SECRET). Hubungi administrator.";
  }
  return null;
}

export async function registerAction(formData: FormData) {
  const secretError = productionAuthSecretError();
  if (secretError) return { error: secretError };

  const raw = {
    nama: formData.get("nama"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const { nama, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email sudah terdaftar" };
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      nama,
      email,
      password: hashed,
      role,
      ...(role === "SISWA"
        ? { studentProfile: { create: {} } }
        : {}),
    },
  });

  try {
    if (role === "SISWA") {
      const cookieStore = await cookies();
      cookieStore.set("kreo-onboarding-pending", "1", {
        maxAge: 60 * 10,
        path: "/",
        sameSite: "lax",
      });
    }

    await signIn("credentials", {
      email,
      password,
      role,
      redirectTo: role === "SISWA" ? "/dashboard?onboarding=1" : "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Gagal masuk setelah registrasi" };
      }
      if (error.type === "CallbackRouteError") {
        return {
          error:
            "Database tidak dapat diakses. Periksa DATABASE_URL di .env lalu jalankan ulang server.",
        };
      }
    }
    throw error;
  }
}

export async function loginAction(formData: FormData) {
  const secretError = productionAuthSecretError();
  if (secretError) return { error: secretError };

  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const { email, password, role } = parsed.data;

  if (await isLoginRateLimited(email)) {
    const remainingMin = Math.ceil(
      (await getLoginLockoutRemainingMs(email)) / 60_000
    );
    return {
      error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${remainingMin} menit.`,
    };
  }

  try {
    if (role === "SISWA") {
      const cookieStore = await cookies();
      cookieStore.set("kreo-onboarding-pending", "1", {
        maxAge: 60 * 10,
        path: "/",
        sameSite: "lax",
      });
    }

    await signIn("credentials", {
      email,
      password,
      role,
      redirectTo: role === "SISWA" ? "/dashboard?onboarding=1" : "/dashboard",
    });
    await clearFailedLogin(email);
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        await recordFailedLogin(email);
        return { error: "Email atau kata sandi salah. Silakan coba lagi." };
      }
      if (error.type === "CallbackRouteError") {
        return {
          error:
            "Database tidak dapat diakses. Periksa DATABASE_URL di .env lalu jalankan ulang server.",
        };
      }
    }
    throw error;
  }
}