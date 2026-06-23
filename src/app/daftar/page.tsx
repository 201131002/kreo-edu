import Link from "next/link";
import { RegisterForm } from "@/components/auth/auth-forms";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardTitle className="text-center text-2xl">Daftar Akun</CardTitle>
        <CardDescription className="text-center">
          Mulai petualangan belajarmu hari ini!
        </CardDescription>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="font-semibold text-primary hover:underline">
            Masuk di sini
          </Link>
        </p>
      </Card>
    </div>
  );
}