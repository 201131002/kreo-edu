"use client";

import { useState, useTransition } from "react";
import { changePasswordAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { KeyRound } from "lucide-react";

export function PasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          setError(null);
          const result = await changePasswordAction(formData);
          if (result?.error) setError(result.error);
        });
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="currentPassword">Password Lama</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      <div>
        <Label htmlFor="newPassword">Password Baru</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <Button type="submit" size="sm" disabled={pending}>
        <KeyRound className="h-4 w-4" />
        {pending ? "Menyimpan..." : "Ubah Password"}
      </Button>
    </form>
  );
}