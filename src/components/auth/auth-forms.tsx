"use client";

import { useState, useTransition } from "react";
import { RoleSelector } from "@/components/auth/role-selector";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { loginAction, registerAction } from "@/actions/auth";

export function LoginForm() {
  const [role, setRole] = useState("SISWA");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          setError(null);
          formData.set("role", role);
          const result = await loginAction(formData);
          if (result?.error) setError(result.error);
        });
      }}
      className="space-y-5"
    >
      <div>
        <Label>Pilih Peran</Label>
        <RoleSelector value={role} onChange={setRole} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="nama@sekolah.sch.id" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="••••••••" required />
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Memproses..." : "Masuk Akun"}
      </Button>
    </form>
  );
}

export function RegisterForm() {
  const [role, setRole] = useState("SISWA");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          setError(null);
          formData.set("role", role);
          const result = await registerAction(formData);
          if (result?.error) setError(result.error);
        });
      }}
      className="space-y-5"
    >
      <div>
        <Label>Pilih Peran</Label>
        <RoleSelector
          value={role}
          onChange={setRole}
          allowedRoles={["SISWA", "GURU"]}
        />
      </div>
      <div>
        <Label htmlFor="nama">Nama Lengkap</Label>
        <Input id="nama" name="nama" placeholder="Budi Santoso" required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="nama@sekolah.sch.id" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="Min. 6 karakter" required />
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Memproses..." : "Buat Akun"}
      </Button>
    </form>
  );
}