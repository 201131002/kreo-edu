"use server";

import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validations";
import { AuthError } from "next-auth";

export async function registerAction(formData: FormData) {
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
    await signIn("credentials", {
      email,
      password,
      role,
      redirectTo: "/dashboard",
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

  try {
    await signIn("credentials", {
      email,
      password,
      role,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Email, password, atau role salah" };
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