import Link from "next/link";
import { LoginForm } from "@/components/auth/auth-forms";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardTitle className="text-center text-2xl">Masuk Akun</CardTitle>
        <CardDescription className="text-center">
          Selamat datang kembali, pahlawan pengetahuan!
        </CardDescription>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Belum punya akun?{" "}
          <Link href="/daftar" className="font-semibold text-primary hover:underline">
            Daftar di sini
          </Link>
        </p>
      </Card>
    </div>
  );
}