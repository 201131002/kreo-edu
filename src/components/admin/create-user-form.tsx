"use client";

import { createUserAction } from "@/actions/admin";
import { RoleSelector } from "@/components/auth/role-selector";
import { SubmitButton } from "@/components/guru/submit-button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import { useState } from "react";

export function CreateUserForm() {
  const [role, setRole] = useState("SISWA");

  return (
    <Card className="border-dashed border-secondary/30 bg-secondary/5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-white">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <CardTitle>Tambah Pengguna Baru</CardTitle>
          <CardDescription>Buat akun siswa, guru, atau admin</CardDescription>
        </div>
      </div>

      <form action={createUserAction} className="space-y-4">
        <div>
          <Label>Peran</Label>
          <RoleSelector value={role} onChange={setRole} />
          <input type="hidden" name="role" value={role} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="admin-nama">Nama Lengkap</Label>
            <Input id="admin-nama" name="nama" placeholder="Nama pengguna" required />
          </div>
          <div>
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              name="email"
              type="email"
              placeholder="email@kreo.id"
              required
            />
          </div>
        </div>
        <div className="sm:max-w-xs">
          <Label htmlFor="admin-password">Password Awal</Label>
          <Input
            id="admin-password"
            name="password"
            type="password"
            placeholder="Min. 6 karakter"
            required
          />
        </div>
        <SubmitButton variant="secondary" size="sm">
          Tambah Pengguna
        </SubmitButton>
      </form>
    </Card>
  );
}